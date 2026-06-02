import { hyderabadLocalities } from '@/lib/locations';

type PassengerType = 'Men' | 'Child' | 'Women';
type Quantities = { [key in PassengerType]: number };
type BusType = 'City Ordinary' | 'Metro Express' | 'Metro Deluxe' | string;

/**
 * Standardized Bus Type Labels
 */
export const BUS_CATEGORIES = {
    ORDINARY: 'City Ordinary',
    EXPRESS: 'Metro Express',
    DELUXE: 'Metro Deluxe'
};

export function calculateFare(
  from: string,
  to: string,
  quantities: Quantities,
  busType: BusType
): number {
  if (!from || !to || from === to || !quantities) {
    return 0;
  }

  const fromLocality = hyderabadLocalities.find(l => l.name === from);
  const toLocality = hyderabadLocalities.find(l => l.name === to);

  if (!fromLocality || !toLocality) {
    return 0;
  }

  const distance = Math.abs(parseInt(fromLocality.routeNumber, 10) - parseInt(toLocality.routeNumber, 10));
  const baseFare = 10 + distance * 1.5; 

  const ordinaryAdultRate = Math.round(Math.max(10, baseFare));
  const ordinaryChildRate = Math.round(ordinaryAdultRate / 2);

  let menRate = ordinaryAdultRate;
  let childRate = ordinaryChildRate;
  let womenRate = 0; 

  // Normalization logic to ensure strict category matching
  const type = (busType || '').toString().toLowerCase();
  let finalBusType = BUS_CATEGORIES.ORDINARY;

  if (type.includes('express')) {
      finalBusType = BUS_CATEGORIES.EXPRESS;
      menRate = ordinaryAdultRate + 5;
      childRate = Math.round(ordinaryChildRate + 2.5);
      womenRate = 0; 
  } else if (type.includes('deluxe')) {
      finalBusType = BUS_CATEGORIES.DELUXE;
      menRate = ordinaryAdultRate + 10;
      childRate = ordinaryChildRate + 5;
      womenRate = ordinaryAdultRate + 10; 
  }

  const totalFare = (quantities.Men * menRate) + (quantities.Child * childRate) + (quantities.Women * womenRate);

  return Math.round(totalFare);
}
