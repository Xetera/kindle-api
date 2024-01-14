export interface Query {
  /**
   * sortType
   */
  sortType:
    | "recency"
    | "title"
    | "author"
    | "acquisition_desc"
    | "acquisition_asc";
}

export interface Filter {
  /**
   * Filter by abonnement.
   */
  originType?: "KINDLE_UNLIMITED" | "PRIME" | "COMICS_UNLIMITED";
  /**
   * Request the next page of results.
   */
  paginationToken?: string;
  /**
   * Set the number of results to return.
   * Default is 50.
   */
  querySize?: number;
  /**
   * When false, pagination is enabled and all results are returned.
   * The default is false and only the first page of results is returned.
   */
  firstPageOnly?: boolean;
}
