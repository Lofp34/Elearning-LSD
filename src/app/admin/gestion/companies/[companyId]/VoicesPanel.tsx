"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Voice = {
  voice_id: string;
  name: string;
};

type CompanyVoiceSelection = {
  femaleVoiceId: string | null;
  femaleVoiceName: string | null;
  maleVoiceId: string | null;
  maleVoiceName: string | null;
};

export default function VoicesPanel({ companyId }: { companyId: string }) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selection, setSelection] = useState<CompanyVoiceSelection>({
    femaleVoiceId: null,
    femaleVoiceName: null,
    maleVoiceId: null,
    maleVoiceName: null,
  });
  const [femaleVoiceId, setFemaleVoiceId] = useState("");
  const [maleVoiceId, setMaleVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadVoices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/voices`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de charger les voix.");
      }

      const availableVoices = (payload.voices ?? []) as Voice[];
      const current = payload.company as CompanyVoiceSelection;
      setVoices(availableVoices);
      setSelection(current);
      setFemaleVoiceId(current.femaleVoiceId ?? "");
      setMaleVoiceId(current.maleVoiceId ?? "");

      if (typeof payload.warning === "string" && payload.warning.trim().length > 0) {
        setError(payload.warning);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const canSave = useMemo(
    () => femaleVoiceId.length > 0 && maleVoiceId.length > 0 && femaleVoiceId !== maleVoiceId,
    [femaleVoiceId, maleVoiceId]
  );

  async function handleSave() {
    if (!canSave) {
      setError("Selectionne 2 voix distinctes.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/voices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ femaleVoiceId, maleVoiceId }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Sauvegarde impossible.");
      }

      setMessage("Voix enregistrees.");
      await loadVoices();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>2. Voix ElevenLabs (societe)</h2>
        <button
          className={styles.ghostButton}
          type="button"
          onClick={() => loadVoices()}
          disabled={loading || saving}
        >
          {loading ? "Chargement..." : "Rafraichir"}
        </button>
      </div>

      <p className={styles.helpText}>
        Choisir une voix feminine et une voix masculine. Elles resteront stables sur les modules.
      </p>

      <div className={styles.voiceGrid}>
        <label className={styles.fieldLabel}>
          Voix feminine
          <select
            value={femaleVoiceId}
            onChange={(event) => setFemaleVoiceId(event.target.value)}
            disabled={loading || saving}
          >
            <option value="">Selectionner...</option>
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          Voix masculine
          <select
            value={maleVoiceId}
            onChange={(event) => setMaleVoiceId(event.target.value)}
            disabled={loading || saving}
          >
            <option value="">Selectionner...</option>
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.inlineMeta}>
        <span>Actuel F: {selection.femaleVoiceName ?? "non defini"}</span>
        <span>Actuel M: {selection.maleVoiceName ?? "non defini"}</span>
      </div>

      <button
        className={styles.primaryButton}
        type="button"
        onClick={handleSave}
        disabled={saving || loading || !canSave}
      >
        {saving ? "Enregistrement..." : "Enregistrer les voix"}
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.success}>{message}</p> : null}
    </section>
  );
}
