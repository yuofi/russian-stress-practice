import { useGoogleLogin } from '@react-oauth/google';
import trpc from '../utils/trpc';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface GoogleCredentials {
  email: string;
  name?: string;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpires?: string;
}

/**
 * Кастомный хук для Google OAuth: переводим хук мутации наружу
 */
export function useGoogleAuth() {
  const { mutateAsync } = trpc.GetAuth.useMutation();
  const queryClient = useQueryClient();

  return useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { 
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            mode: 'cors'
          }
        ).then(res => res.json());

        const creds: GoogleCredentials = {
          email: userInfo.email,
          name: userInfo.name,
          providerId: userInfo.sub,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.access_token,
          tokenExpires: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        };

        const result = await mutateAsync({
          provider: 'GOOGLE',
          credentials: creds,
        });
        
        console.log('Authentication result:', result);
        
        // Сохраняем JWT токен, полученный от нашего бэкенда
        if (result.token) {
          Cookies.set('token', result.token);
          console.log('Token saved to cookies:', result.token.substring(0, 20) + '...');
        } else {
          console.error('No token received from backend');
        }
        
        queryClient.invalidateQueries(['GetMe']);
        window.location.reload()
      } catch (error) {
        console.error('Ошибка Google OAuth:', error);
      }
    },
    onError: (error) => {
      console.error('Не удалось войти через Google:', error);
    },
  });
}
