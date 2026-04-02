import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NIVEAUX = [
  'Sans intérêt','Régional','U17 nationaux','U19 nationaux','N2/N3','National',
  'Ligue 2 remplaçant','Ligue 2 titulaire','Ligue 1 remplaçant','Ligue 1 titulaire',
  'Top 5 européen','Champions League',
];

const DECISIONS = ['sans_interet','revoir','essai','retenu','europe','signer'];

function buildSystemPrompt(playerNumber: string | null) {
  const playerFilterRules = playerNumber
    ? `- Le numéro cible est ${playerNumber}. N'extrais que les infos explicitement liées à ce numéro (ex: "${playerNumber} :", "N°${playerNumber}", "#${playerNumber}", "joueur ${playerNumber}")
- Ignore totalement les observations des autres numéros, même si elles semblent pertinentes
- Si le numéro ${playerNumber} n'est pas clairement identifiable, renvoie des champs vides/null plutôt que d'inventer`
    : `- S'il y a plusieurs joueurs, fais une synthèse globale la plus cohérente possible à partir de la note`;

  return `Tu es un assistant de scouting football. Tu analyses des photos de notes manuscrites ou de captures d'écran de notes prises par un scout lors d'un match.

Tu dois extraire les informations et les retourner UNIQUEMENT sous forme de JSON valide, sans texte avant ou après.

Structure JSON attendue :
{
  "contexte": "string (ex: Match amical, Détection, Championnat...)",
  "minutesJouees": "string (nombre de minutes, ex: 90, 45, 70...)",
  "lieu": "string ou null (ville si mentionnée)",
  "commentaires": {
    "physique": "string (analyse physique du joueur)",
    "technique": "string (analyse technique)",
    "tactique": "string (analyse tactique)",
    "mentalite": "string (analyse mentale/comportementale)"
  },
  "ratings": {
    "physique": number (1-6),
    "technique": number (1-6),
    "tactique": number (1-6),
    "mentalite": number (1-6)
  },
  "conclusion": "string (synthèse globale du joueur)",
  "niveauActuel": "string ou null (parmi : ${NIVEAUX.join(', ')})",
  "potentiel": "string ou null (parmi : ${NIVEAUX.join(', ')})",
  "decision": "string ou null (parmi : ${DECISIONS.join(', ')})"
}

Règles :
- Si une info n'est pas présente dans les notes, mets null pour les champs optionnels ou une chaîne vide pour les commentaires/conclusion
- Pour les ratings, si pas de note explicite, estime à partir du commentaire (1=très mauvais, 6=excellent)
- Pour niveauActuel et potentiel, choisis la valeur la plus proche de la liste fournie
- Pour decision : sans_interet=pas intéressant, revoir=à revoir, essai=à l'essai, retenu=retenu académie, europe=test Europe, signer=à signer
- Réponds UNIQUEMENT avec le JSON, pas de markdown, pas d'explication
${playerFilterRules}`;
}

export async function POST(req: Request) {
  try {
    const { image, mimeType, playerNumber } = await req.json() as { image: string; mimeType: string; playerNumber?: string | null };
    const cleanPlayerNumber = typeof playerNumber === 'string' ? playerNumber.trim() : '';

    if (!image) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isPdf = mimeType === 'application/pdf';

    const fileContent = isPdf
      ? {
          type: 'document' as const,
          source: {
            type: 'base64' as const,
            media_type: 'application/pdf' as const,
            data: image,
          },
        }
      : {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: (allowedImageTypes.includes(mimeType) ? mimeType : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: image,
          },
        };

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(cleanPlayerNumber || null),
      messages: [
        {
          role: 'user',
          content: [
            fileContent,
            {
              type: 'text',
              text: cleanPlayerNumber
                ? `Analyse ces notes de scout et retourne le JSON structuré pour le joueur numéro ${cleanPlayerNumber} uniquement.`
                : 'Analyse ces notes de scout et retourne le JSON structuré.',
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Impossible de parser la réponse IA' }, { status: 500 });
      }
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[POST /api/transcribe-notes]', err);
    return NextResponse.json({ error: 'Erreur lors de la transcription' }, { status: 500 });
  }
}
