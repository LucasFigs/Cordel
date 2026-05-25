import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// ── Helper: monta iniciais ────────────────────────────────────────────────────
function makeInitials(firstName: string, lastName: string): string {
  return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
}

// ── Converte User do Firebase → UserProfile do app ────────────────────────────
export async function firebaseUserToProfile(
  user: User,
  extra?: Partial<UserProfile>,
): Promise<UserProfile> {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const displayName = user.displayName ?? '';
  const parts       = displayName.split(' ');
  const firstName   = extra?.firstName ?? parts[0] ?? 'Usuário';
  const lastName    = extra?.lastName  ?? (parts.slice(1).join(' ') || 'Cordel');
  const provider    = (user.providerData[0]?.providerId ?? 'email') as UserProfile['provider'];

  const profile: UserProfile = {
    id:        user.uid,
    firstName,
    lastName,
    email:     user.email ?? '',
    role:      'visitante',
    initials:  makeInitials(firstName, lastName),
    provider,
    photoURL:  user.photoURL ?? undefined,
    bio:       '',
    address:   '',
    phone:     '',
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return profile;
}

// ── Login com e-mail ──────────────────────────────────────────────────────────
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<UserProfile> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return firebaseUserToProfile(user);
}

// ── Cadastro com e-mail ───────────────────────────────────────────────────────
export async function registerWithEmail(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: `${firstName} ${lastName}` });
  return firebaseUserToProfile(user, { firstName, lastName });
}

// ── Login com Google ──────────────────────────────────────────────────────────
export async function loginWithGoogle(accessToken: string): Promise<UserProfile> {
  const credential = GoogleAuthProvider.credential(null, accessToken);
  const { user }   = await signInWithCredential(auth, credential);
  return firebaseUserToProfile(user);
}

// ── Login com Facebook ────────────────────────────────────────────────────────
export async function loginWithFacebook(accessToken: string): Promise<UserProfile> {
  const credential = FacebookAuthProvider.credential(accessToken);
  const { user }   = await signInWithCredential(auth, credential);
  return firebaseUserToProfile(user);
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ── Atualizar perfil no Firestore ─────────────────────────────────────────────
export async function updateUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
}
