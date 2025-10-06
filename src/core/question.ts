export class Question{
    titre: string;
    description: string;
    reponse: boolean;
    texteVrai: string;
    texteFaux: string;
    categorie:string;
    idGroupe: string;


    constructor(
        titre: string,
        description: string,
        reponse: boolean,
        texteVrai: string,
        texteFaux: string,
        categorie:string,
        idGroupe: string
    ) {
        if (!titre) {
            throw new Error('Le titre de la question est requis');
        }

        if (!description) {
            throw new Error('Un énoncé est requis pour la question');
        }

        if (!texteFaux) {
            this.texteFaux = "la réponse est fausse!";
        }else{
            this.texteFaux = texteFaux;
        }

        if (!texteVrai) {
            this.texteVrai = "la réponse est correcte!";
        }else{
            this.texteVrai = texteVrai;
        }

        this.titre = titre;
        this.description = description;
        this.reponse = reponse;
        this.categorie = categorie;
        this.idGroupe = idGroupe;
    }
    
    public getTitre(): string {
        return this.titre;
    }

    public getDescription(): string {
        return this.description;
    }

    public getReponse(): boolean {
        return this.reponse;
    }

    public getTexteVrai(): string {
        return this.texteVrai;
    }

    public getTexteFaux(): string {
        return this.texteFaux;
    }

    public getCategorie(): string {
        return this.categorie;
    }


}

