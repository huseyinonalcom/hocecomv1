import { storeData } from "../storedata";
import { getData } from "../readdata";

const parseLanguage = (language: string) => {
  switch (language) {
    case "en":
      return "en";
    case "nl":
      return "nl";
    case "fr":
      return "fr";
    case "tr":
      return "tr";
    default:
      return "tr";
  }
};

let currentLanguage: "en" | "fr" | "nl" | "tr" = "tr";

export const initLocalization = async () => {
  currentLanguage = parseLanguage((await getData("language")) ?? "tr");
};

export const setLanguage = (language: "en" | "nl" | "fr" | "tr") => {
  storeData({ key: "language", value: language });
  currentLanguage = language;
};

const enDictionary = require("./locales/en.json");
const nlDictionary = require("./locales/nl.json");
const frDictionary = require("./locales/fr.json");
const trDictionary = require("./locales/tr.json");

export const t = (key: string) => {
  switch (currentLanguage) {
    case "en":
      return enDictionary[key] ?? missingKey(key);
    case "nl":
      return nlDictionary[key] ?? missingKey(key);
    case "fr":
      return frDictionary[key] ?? missingKey(key);
    case "tr":
      return trDictionary[key] ?? missingKey(key);
  }
};

let missingKeys: { [key: string]: string } = {};

const missingKey = (key: string) => {
  missingKeys[key] = key;
  return key;
};

export const logMissingKeys = () => {
  console.log("Missing keys", missingKeys);
};
