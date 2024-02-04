class NoErrorThrownError extends Error {}

/**
 * This helper function is used to test that a function throws an error.
 * The caught error is returned so that it can be inspected.
 * If the function does not throw an error, a `NoErrorThrownError` is thrown.
 */
export async function getError(call: () => unknown): Promise<unknown> {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error: unknown) {
    return error;
  }
}
