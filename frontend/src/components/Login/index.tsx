import React, { useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useGoogleAuth  } from "../../utils/googleAuth";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Login({ isOpen, onClose }: LoginProps) {
  const login = useGoogleAuth();
  const handleGoogleLoginClick = async () => {
    try {
      login();
      onClose();
    } catch (error) {
      console.error('Failed to login with Google:', error);
    }
  };

  const handleYandexLogin = async () => {
    // TODO: Implement Yandex OAuth
    console.log("Yandex login clicked");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center mb-4"
                >
                  Войти в аккаунт
                </Dialog.Title>

                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleGoogleLoginClick}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://www.google.com/favicon.ico"
                      alt="Google logo"
                    />
                    Войти через Google
                  </button>

                  <button
                    onClick={handleYandexLogin}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://yastatic.net/s3/home-static/_/7c/7ccf30cd11b00c2eb4f79f698da24aa2.png"
                      alt="Yandex logo"
                    />
                    Войти через Яндекс
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}