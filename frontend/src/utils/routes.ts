import { pgr } from "./pumpGetRoute";

export const GetStressPractice = pgr(() => "/");
export const GetParonymsPractice = pgr(() => "/paronyms");
export const GetLogOut = pgr(() => "/logout");
export const GetPersonalDictionary = () => "/personal-dictionary";

