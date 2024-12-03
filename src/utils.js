export function formatNumber(number) {
  let numberToParse = number
  if (typeof number === "string") {
    numberToParse = parseInt(number, 10)
    if (isNaN(numberToParse)) {
      return number
    }
  }

  return new Intl.NumberFormat().format(numberToParse);
}