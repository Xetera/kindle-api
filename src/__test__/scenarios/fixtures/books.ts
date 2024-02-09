import { KindleBookData } from "../../../book.js";
import {
  KindleBookMetadataResponse,
  KindleOwnedBookMetadataResponse,
} from "../../../book-metadata.js";

export const sample1: KindleBookData = {
  title: "Journey to the Center of the Earth",
  asin: "B000FBJG4U",
  authors: ["Jules Verne"],
  mangaOrComicAsin: false,
  resourceType: "EBOOK",
  originType: "purchased",
  percentageRead: 0,
  productUrl: "https://www.amazon.com/dp/B000FBJG4U",
  webReaderUrl:
    "https://read.amazon.com/kp/kshare?asin=B000FBJG4U&id=wRj3DwAAQBAJ",
};

export const sample1Details: KindleOwnedBookMetadataResponse = {
  YJFormatVersion: "1.0",
  clippingLimit: 0,
  contentType: "EBOK",
  contentVersion: "1.0",
  deliveredAsin: "B000FBJG4U",
  format: "EBOK",
  formatVersion: "1.0",
  hasAnnotations: false,
  isOwned: true,
  isSample: false,
  kindleSessionId: "wRj3DwAAQBAJ",
  lastPageReadData: {
    deviceName: "Kindle Reader",
    position: 0,
    syncTime: 0,
  },
  metadataUrl:
    "https://read.amazon.com/service/metadata/lookup?asin=B000FBJG4U&metadataVersion=1",
  originType: "Purchased",
  requestedAsin: "B000FBJG4U",
  srl: 0,
  manifestUrl: null,
  pageNumberUrl: null,
};

export const sample1MetaData: KindleBookMetadataResponse = {
  ACR: "B000FBJG4U",
  asin: "B000FBJG4U",
  version: "v1",
  startPosition: 1,
  endPosition: 100,
  releaseDate: "2009-04-01T00:00:00.000Z",
  title: "Journey to the Center of the Earth",
  sample: false,
  authorList: ["Jules Verne"],
  publisher: "Public Domain Books",
};

export const sample2: KindleBookData = {
  title: "The Great Gatsby",
  asin: "B08R3YVH53",
  authors: ["F. Scott Fitzgerald"],
  mangaOrComicAsin: false,
  resourceType: "EBOOK_SAMPLE",
  originType: "sampled",
  percentageRead: 0,
  productUrl: "https://www.amazon.com/dp/B08R3YVH53",
  webReaderUrl:
    "https://read.amazon.com/kp/kshare?asin=B08R3YVH53&id=wRj3DwAAQBAJ",
};

export const sample2Details: KindleOwnedBookMetadataResponse = {
  YJFormatVersion: "1.0",
  clippingLimit: 0,
  contentType: "EBOK",
  contentVersion: "1.0",
  deliveredAsin: "B08R3YVH53",
  format: "EBOK",
  formatVersion: "1.0",
  hasAnnotations: false,
  isOwned: true,
  isSample: false,
  kindleSessionId: "wRj3DwAAQBAJ",
  lastPageReadData: {
    deviceName: "Kindle Reader",
    position: 0,
    syncTime: 0,
  },
  metadataUrl:
    "https://read.amazon.com/service/metadata/lookup?asin=B08R3YVH53&metadataVersion=1",
  originType: "Purchased",
  requestedAsin: "B08R3YVH53",
  srl: 0,
  manifestUrl: null,
  pageNumberUrl: null,
};

export const sample2MetaData: KindleBookMetadataResponse = {
  ACR: "B08R3YVH53",
  asin: "B08R3YVH53",
  version: "v1",
  startPosition: 1,
  endPosition: 100,
  releaseDate: "2009-04-01T00:00:00.000Z",
  title: "The Great Gatsby",
  sample: false,
  authorList: ["F. Scott Fitzgerald"],
  publisher: "Public Domain Books",
};

export const sample3: KindleBookData = {
  title: "Astrophysics for People in a Hurry",
  asin: "B01MAWTBKV",
  authors: ["Neil deGrasse Tyson"],
  mangaOrComicAsin: false,
  resourceType: "EBOOK",
  originType: "gifted",
  percentageRead: 0,
  productUrl: "https://www.amazon.com/dp/B01MAWTBKV",
  webReaderUrl:
    "https://read.amazon.com/kp/kshare?asin=B01MAWTBKV&id=wRj3DwAAQBAJ",
};
