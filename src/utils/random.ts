/** 8자리 난수 생성 */
export const generate8DigitId = () => {
  return crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString()
    .padStart(8, "0")
    .slice(0, 8);
};
