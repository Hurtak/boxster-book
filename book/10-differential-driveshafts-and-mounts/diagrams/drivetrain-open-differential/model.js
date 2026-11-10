export function differentialSpeeds(carrierRpm, differencePercent) {
  const delta = carrierRpm * differencePercent / 100;
  return { leftRpm: carrierRpm - delta, rightRpm: carrierRpm + delta };
}

export function openDifferentialTorque(requestedNm, leftCapacityNm, rightCapacityNm = 600) {
  const eachNm = Math.min(requestedNm / 2, leftCapacityNm, rightCapacityNm);
  return { eachNm, totalNm: 2 * eachNm, unusedNm: requestedNm - 2 * eachNm };
}
