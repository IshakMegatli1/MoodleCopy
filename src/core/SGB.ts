import fetch from 'node-fetch'; // npm i node-fetch

const BASE = 'http://localhost:3200/api/v3';

export class SGB {
  // GET /teacher/login?email&password
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


  // GET /teacher/fromtoken?token -> {user} 
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


  // GET /teacher/all
  static async getTousLesEnseignants(): Promise<
    Array<{ first_name: string; last_name: string; id: string }>
  > {
    const r = await fetch(`${BASE}/teacher/all`);
    if (!r.ok) throw new Error(`SGB /teacher/all ${r.status}`);
    return r.json() as Promise<Array<{ first_name: string; last_name: string; id: string }>>;
  }

  // GET /Schedule/all
  static async getListeCours(email: string): Promise<Array<{
    group_id: string;
    day: string;
    hours: string;
    activity: string;
    mode: string;
    local: string;
    teacher_id: string;
  }>> {
    const r = await fetch(`${BASE}/Schedule/all`);
    if (!r.ok) throw new Error(`SGB /Schedule/all ${r.status}`);
    const json: any = await r.json();
    // Filtrer seulement les cours avec le professeur connecté
    return (json.data as Array<{
      group_id: string;
      day: string;
      hours: string;
      activity: string;
      mode: string;
      local: string;
      teacher_id: string;
    }>).filter(cours => cours.teacher_id === email);
  }

  // GET /student/all
  static async getListeEtudiants(): Promise<Array<{
    first_name: string;
    last_name: string;
    id: string;
  }>> {
    const r = await fetch(`${BASE}/student/all`);
    if (!r.ok) throw new Error(`SGB /student/all ${r.status}`);
    const json: any = await r.json();
    return json.data as Array<{ first_name: string; last_name: string; id: string }>;
  }

  static async getEtudiantsDuGroupe(groupId: string): Promise<Array<{
    group_id: string;
    student_id: string;
  }>> {
    const qs = new URLSearchParams({ group_id: groupId }).toString();
    const r = await fetch(`${BASE}/student/groupstudent?${qs}`);
    if (!r.ok) throw new Error(`SGB /student/groupstudent ${r.status}`);
    const json: any = await r.json();
    return json.data as Array<{ group_id: string; student_id: string }>;
  }

  // GET /student/login?email&password
  static async authentifierEtudiant(email: string, password: string): Promise<{
    message: string;
    token: string;
    user: { first_name: string; last_name: string; id: string };
  }> {
    const qs = new URLSearchParams({ email, password }).toString();
    const r = await fetch(`${BASE}/student/login?${qs}`);
    if (!r.ok) throw new Error(`SGB /student/login ${r.status}`);
    return await r.json();
  }

  // GET /student/fromtoken?token -> {user} 
  static async getEtudiant(token: string): Promise<{
    user: { first_name: string; last_name: string; id: string };
  }> {
    const qs = new URLSearchParams({ token }).toString();
    const r = await fetch(`${BASE}/student/fromtoken?${qs}`); // Changement ici : ?token= au lieu de /:token
    if (!r.ok) throw new Error(`SGB /student/fromtoken ${r.status}`);
    return await r.json();
  }

  static async getGroupesPourEtudiant(studentId: string): Promise<Array<{
    group_id: string;
    student_id: string;
  }>> {
    const qs = new URLSearchParams({ student_id: studentId }).toString();
    const r = await fetch(`${BASE}/student/groupstudent?${qs}`);
    if (!r.ok) throw new Error(`SGB /student/groupstudent ${r.status}`);
    const json: any = await r.json();
    return json.data as Array<{ group_id: string; student_id: string }>;
  }
}


