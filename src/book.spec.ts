import { KindleBook } from "./book";
import { describe, it, expect } from "vitest"

describe("Normalization of amazon's clown world author format", () => {
  it("standard author format", () => {
    expect(KindleBook.normalizeAuthors(['Thorensen, Olan:'])).toStrictEqual([{ firstName: "Olan", lastName: "Thorensen"}])
  })

  it("authors with one name", () => {
    expect(KindleBook.normalizeAuthors(['Maddox:'])).toStrictEqual([{ firstName: "Maddox", lastName: "" }])
  })

  it("authors with one name but repeated twice", () => {
    expect(KindleBook.normalizeAuthors(['Maddox:Maddox'])).toStrictEqual([{ firstName: "Maddox", lastName: "" }])
  })
})
