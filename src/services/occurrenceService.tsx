import * as firebase from 'firebase/app';
import 'firebase/firestore';
const COLLECTION = 'occurrences';

// ── Criar ocorrência ──────────────────────────────────────────────────────────

export async function createOccurrence(
  data: OccurrenceData,
): Promise<OccurrenceRecord> {
  const protocol = Math.floor(100000 + Math.random() * 900000);

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    protocol,
    status:    'Pendente',
    createdAt: serverTimestamp(),
  });

  return {
    ...data,
    id:       docRef.id,
    protocol,
    status:   'Pendente',
  };
}

// ── Listar ocorrências do usuário ─────────────────────────────────────────────

export async function fetchUserOccurrences(
  userId: string,
): Promise<OccurrenceRecord[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId',  '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data();
    // Converte Timestamp do Firestore para string formatada
    const createdAt = data.createdAt instanceof Timestamp
      ? formatTimestamp(data.createdAt)
      : data.dateTime ?? '';

    return {
      id:          d.id,
      protocol:    data.protocol,
      status:      data.status,
      type:        data.type,
      severity:    data.severity,
      description: data.description,
      dateTime:    createdAt,
      userId:      data.userId,
      place:       data.place,
      rating:      data.rating,
    } as OccurrenceRecord;
  });
}

// ── Excluir ocorrência pendente ───────────────────────────────────────────────

export async function deleteOccurrence(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ── Helper: formata Timestamp ─────────────────────────────────────────────────

function formatTimestamp(ts: Timestamp): string {
  const d      = ts.toDate();
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const pad    = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}  ·  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
