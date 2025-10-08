import { SGB } from './SGB';
import { Enseignant } from './enseignant';

export class ControleurEnseignant {
  /** retourne le token (utile pour le front) */
  async authentifier(email: string, password: string): Promise<string> {
    const { token } = await SGB.authentifierEnseignant(email, password);
    return token;
  }

  /** construit l’enseignant à partir du token (validation du token) */
  async getEnseignant(token: string): Promise<Enseignant> {
    const { user } = await SGB.getEnseignant(token);
    return new Enseignant(user.first_name, user.last_name, user.id, token);
  }
}
