"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getAddressFromCoords } from "@/lib/geocoding";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
});

type DriverOption = {
  slug: string;
  displayName: string;
};

type FormData = {
  driverSlug: string;
  label: string;
  lat: string;
  lng: string;
  occurredAt: string;
  note: string;
};

type AddStopFormProps = {
  drivers: DriverOption[];
};

export default function AddStopForm({ drivers }: AddStopFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    driverSlug: "",
    label: "",
    lat: "",
    lng: "",
    occurredAt: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasManualLabel, setHasManualLabel] = useState(false);
  const [mapTarget, setMapTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const lat = Number(formData.lat);
    const lng = Number(formData.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    if (hasManualLabel && formData.label.trim().length > 0) {
      return;
    }

    let cancelled = false;

    async function fetchAddress() {
      try {
        const newLabel = await getAddressFromCoords(lat, lng);
        if (cancelled || !newLabel) return;

        setFormData((prev) => {
          if (hasManualLabel && prev.label.trim().length > 0) {
            return prev;
          }
          return { ...prev, label: newLabel };
        });
      } catch (error) {
        if (!cancelled) {
          setMessage("Nepodarilo sa získať adresu z GPS súradníc.");
        }
      }
    }

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [formData.lat, formData.lng, formData.label, hasManualLabel]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "label") {
      setHasManualLabel(true);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        driverSlug: formData.driverSlug,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        label: formData.label,
        ...(formData.occurredAt && { occurredAt: formData.occurredAt }),
        ...(formData.note && { note: formData.note }),
      };

      const response = await fetch("/api/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage("Zastavenie bolo úspešne uložené!");
        setTimeout(() => router.push("/"), 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Chyba pri ukladaní zastavenia.");
      }
    } catch (error) {
      setMessage("Chyba siete. Skúste to znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-700"
    >
      <div>
        <label
          htmlFor="driverSlug"
          className="block text-sm font-medium mb-1 text-gray-200"
        >
          Šofér
        </label>
        <select
          id="driverSlug"
          name="driverSlug"
          value={formData.driverSlug}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 text-gray-100 border border-gray-600 p-2 rounded"
        >
          <option value="">Vyberte šoféra</option>
          {drivers.map((driver) => (
            <option key={driver.slug} value={driver.slug}>
              {driver.displayName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="label" className="block text-sm font-medium mb-1">
          Popis zastavenia
        </label>
        <input
          type="text"
          id="label"
          name="label"
          value={formData.label}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded bg-gray-800 text-gray-100 border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-300">Klikni na mapu pre výber polohy</p>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              if (!navigator.geolocation) {
                setMessage("Tvoje zariadenie nepodporuje zisťovanie polohy.");
                return;
              }

              setIsLocating(true);

              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLat = position.coords.latitude;
                  const newLng = position.coords.longitude;

                  setFormData((prev) => ({
                    ...prev,
                    lat: String(newLat),
                    lng: String(newLng),
                  }));
                  setMapTarget({ lat: newLat, lng: newLng });
                  setIsLocating(false);
                },
                (error) => {
                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      setMessage("Nepovolila si prístup k polohe.");
                      break;
                    case error.POSITION_UNAVAILABLE:
                      setMessage("Polohu sa nepodarilo získať.");
                      break;
                    default:
                      setMessage("Nepodarilo sa zistiť polohu.");
                      break;
                  }
                  setIsLocating(false);
                },
              );
            }}
            disabled={isLocating || isSubmitting}
            className="text-xs text-sky-300 hover:text-sky-200 disabled:text-gray-500"
          >
            {isLocating ? "Zisťujem polohu..." : "📍 Použiť moju polohu"}
          </button>
        </div>

        <MapPicker
          lat={formData.lat ? parseFloat(formData.lat) : null}
          lng={formData.lng ? parseFloat(formData.lng) : null}
          onChange={(lat, lng) => {
            setFormData((prev) => ({
              ...prev,
              lat: String(lat),
              lng: String(lng),
            }));
            setMapTarget({ lat, lng });
          }}
          flyTo={mapTarget}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lat"
            className="block text-sm font-medium mb-1 text-gray-200"
          >
            Zemepisná šírka (lat)
          </label>
          <input
            type="number"
            step="any"
            id="lat"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 text-gray-100 border border-gray-600 p-2 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="lng"
            className="block text-sm font-medium mb-1 text-gray-200"
          >
            Zemepisná dĺžka (lng)
          </label>
          <input
            type="number"
            step="any"
            id="lng"
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 text-gray-100 border border-gray-600 p-2 rounded"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Zatiaľ zadaj súradnice ručne. Neskôr sem môžeme pridať výber kliknutím
        na mapu.
      </p>

      <div>
        <label htmlFor="occurredAt" className="block text-sm font-medium mb-1">
          Dátum a čas (voliteľné)
        </label>
        <input
          type="datetime-local"
          id="occurredAt"
          name="occurredAt"
          value={formData.occurredAt}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-1">
          Poznámka (voliteľné)
        </label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          className="w-full border p-2 rounded"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded ${message.includes("úspešne") ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300"}`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? "Ukladanie..." : "Uložiť zastavenie"}
      </button>
    </form>
  );
}
