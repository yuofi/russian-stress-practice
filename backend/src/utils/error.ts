export class ExpectedError extends Error {
  isExpected = true as const;
}
