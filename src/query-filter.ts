export interface Query {
  /**
   * Defines the order of the results.
   * The default is "recency".
   */
  sortType?:
    | "recency"
    | "title"
    | "author"
    | "acquisition_desc"
    | "acquisition_asc";
}

export interface Filter {
  /**
   * Filter by abonnement.
   * By default, the filter is unset.
   */
  originType?: "KINDLE_UNLIMITED" | "PRIME" | "COMICS_UNLIMITED";
  /**
   * Request the next page of results.
   * This is returned in the response of the previous request and is usually used internally when @see fetchAllPages is true.
   */
  paginationToken?: string;
  /**
   * Set the number of results to return.
   * Default is 50.
   */
  querySize?: number;
  /**
   * The results of the kindle api are paginated, by default only the first page is fetched.
   * When true, all results will be fetched if neccessary.
   * This will result in multiple requests to the kindle api (one for each page).
   * The default value is false.
   */
  fetchAllPages?: boolean;
}
