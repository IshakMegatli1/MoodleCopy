// Classe qui contient toutes les commandes possibles du SGB

export class SGB {

    //Écho pour vérifier le fonctionnement du SGB
    public static async ping(): Promise<string> {
        const res = await fetch(`http://localhost:3200/api/v3/health/ping`);
        if (!res.ok) throw new Error(`SGB ping failed: ${res.status}`);
        return await res.text();
    }

}

SGB.ping()
  .then(msg => console.log("SGB:", msg))
  .catch(err => console.error(err));