  import fetch from 'node-fetch'; // npm i node-fetch

const BASE = 'http://localhost:3200/api/v3';

export class SGB {
  /** GET /teacher/login?email&password -> {message, token, user} */
  static async authentifierEnseignant(email: string, password: string): Promise<{
  message: string;
  token: string;
  user: { first_name: string; last_name: string; id: string };
}> {
  const qs = new URLSearchParams({ email, password }).toString();
  const r = await fetch(`${BASE}/teacher/login?${qs}`);
  if (!r.ok) throw new Error(`SGB /teacher/login ${r.status}`);

  const data = (await r.json()) as {
    message: string;
    token: string;
    user: { first_name: string; last_name: string; id: string };
  };
  return data;
}


  /** GET /teacher/fromtoken?token -> {user} */
  static async getEnseignant(token: string): Promise<{
  user: { first_name: string; last_name: string; id: string };
}> {
  const qs = new URLSearchParams({ token }).toString();
  const r = await fetch(`${BASE}/teacher/fromtoken?${qs}`);
  if (!r.ok) throw new Error(`SGB /teacher/fromtoken ${r.status}`);

  const data = (await r.json()) as {
    user: { first_name: string; last_name: string; id: string };
  };
  return data;
}


  /** (optionnel) GET /teacher/all -> [{...}] */
  static async getTousLesEnseignants(): Promise<
    Array<{ first_name: string; last_name: string; id: string }>
  > {
    const r = await fetch(`${BASE}/teacher/all`);
    if (!r.ok) throw new Error(`SGB /teacher/all ${r.status}`);
    return r.json() as Promise<Array<{ first_name: string; last_name: string; id: string }>>;
  }
}
