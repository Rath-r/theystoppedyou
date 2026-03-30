type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export async function getAddressFromCoords(
  lat: number,
  lng: number,
): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat,
  )}&lon=${encodeURIComponent(lng)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "TheyStoppedYou/1.0 (https://github.com/yourusername/theystoppedyou)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed (${response.status})`);
  }

  const data = (await response.json()) as NominatimReverseResponse;

  if (!data?.address && !data?.display_name) {
    return null;
  }

  const address = data.address ?? {};

  const roadPart =
    [address.road, address.pedestrian, address.house_number]
      .filter(Boolean)
      .join(" ") || "";

  const areaPart = [
    address.neighbourhood,
    address.suburb,
    address.city,
    address.town,
    address.village,
    address.municipality,
  ]
    .filter(Boolean)
    .join(", ");

  const labelCandidate = [roadPart, areaPart].filter(Boolean).join(", ");

  if (labelCandidate) {
    return labelCandidate;
  }

  if (data.display_name) {
    return data.display_name;
  }

  return null;
}
