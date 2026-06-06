import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local to load env variables manually
try {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
    console.log('Successfully loaded environment variables from .env.local');
  } else {
    console.warn('.env.local file not found, trying default process.env');
  }
} catch (e) {
  console.warn('Warning: Could not parse .env.local file', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedRecords = [
  {
    "dateTime": "2026-05-22T11:15:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito", "aburrimiento"],
    "anxietyLevel": 3,
    "quantity": "1 pipazo",
    "notes": "No sé, el mañanero de costumbre de nuevo al pedo"
  },
  {
    "dateTime": "2026-05-22T14:30:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito"],
    "anxietyLevel": 4,
    "quantity": "2 pipazos",
    "notes": "Terminé de almorzar y me dieron las ganas de siempre de comer rico y después fumar"
  },
  {
    "dateTime": "2026-05-23T18:45:00.000Z",
    "emotionalState": "enojado",
    "triggers": ["problemas_personales", "ansiedad"],
    "anxietyLevel": 8,
    "quantity": "6 pipas",
    "notes": "Otra discusión con mis hermanos por el tema de la herencia de mi papá, me saca de quicio la situación"
  },
  {
    "dateTime": "2026-05-24T02:15:00.000Z",
    "emotionalState": "aburrido",
    "triggers": ["insomnio", "aburrimiento"],
    "anxietyLevel": 6,
    "quantity": "4 pipas",
    "notes": "Me desperté a la madrugada con hambre, comí algo y no me pude volver a dormir, así que me puse a fumar"
  },
  {
    "dateTime": "2026-05-25T10:45:00.000Z",
    "emotionalState": "estresado",
    "triggers": ["estres_laboral", "ansiedad"],
    "anxietyLevel": 7,
    "quantity": "2 pipazos",
    "notes": "Arrancando la semana con bastantes cosas pendientes en la cabeza"
  },
  {
    "dateTime": "2026-05-26T21:30:00.000Z",
    "emotionalState": "feliz",
    "triggers": ["celebracion", "habito"],
    "anxietyLevel": 5,
    "quantity": "1 pipazo",
    "notes": "Cenando rico para cerrar el martes, fumé un pipazo por pura costumbre"
  },
  {
    "dateTime": "2026-05-27T12:15:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito", "aburrimiento"],
    "anxietyLevel": 4,
    "quantity": "1 pipazo",
    "notes": "Esperando el almuerzo, fumé para abrir el apetito"
  },
  {
    "dateTime": "2026-05-28T16:20:00.000Z",
    "emotionalState": "ansioso",
    "triggers": ["ansiedad", "problemas_personales"],
    "anxietyLevel": 7,
    "quantity": "3 pipas",
    "notes": "Llamaron de nuevo por los kilombos de los terrenos de mi papá, me dio mucha ansiedad"
  },
  {
    "dateTime": "2026-05-29T10:05:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito"],
    "anxietyLevel": 3,
    "quantity": "1 pipazo",
    "notes": "El mañanero de rutina apenas me levanté"
  },
  {
    "dateTime": "2026-05-30T23:50:00.000Z",
    "emotionalState": "aburrido",
    "triggers": ["aburrimiento", "insomnio"],
    "anxietyLevel": 6,
    "quantity": "5 pipas",
    "notes": "Fin de semana solo en casa, desvelado sin saber qué hacer"
  },
  {
    "dateTime": "2026-06-01T11:30:00.000Z",
    "emotionalState": "estresado",
    "triggers": ["estres_laboral"],
    "anxietyLevel": 6,
    "quantity": "2 pipazos",
    "notes": "Mucho trabajo acumulado hoy lunes por la mañana"
  },
  {
    "dateTime": "2026-06-02T15:10:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito", "aburrimiento"],
    "anxietyLevel": 4,
    "quantity": "2 pipazos",
    "notes": "Terminé de comer y me dieron ganas, es una costumbre difícil de romper después de los almuerzos"
  },
  {
    "dateTime": "2026-06-03T20:45:00.000Z",
    "emotionalState": "enojado",
    "triggers": ["problemas_personales"],
    "anxietyLevel": 8,
    "quantity": "5 pipas",
    "notes": "Siguen los problemas con mis hermanos por la herencia, no nos ponemos de acuerdo y me da mucha rabia"
  },
  {
    "dateTime": "2026-06-04T10:15:00.000Z",
    "emotionalState": "neutral",
    "triggers": ["habito"],
    "anxietyLevel": 3,
    "quantity": "1 pipazo",
    "notes": "Desperté tarde y fumé de una por inche costumbre"
  }
];

async function runSeed() {
  console.log('--- Supabase Seed Script ---');
  console.log('Connecting to:', supabaseUrl);
  console.log('1. Clearing old records from "registros_consumo"...');
  
  const { error: deleteError } = await supabase
    .from('registros_consumo')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error clearing old records:', deleteError);
    process.exit(1);
  }
  
  console.log('2. Inserting seed records...');
  
  const recordsToInsert = seedRecords.map(record => ({
    fecha: record.dateTime,
    cantidad_consumida: record.quantity,
    emocion: record.emotionalState,
    nivel_ansiedad: record.anxietyLevel,
    motivos: record.triggers,
    notas: record.notes,
    stock_restante: null
  }));

  const { data, error: insertError } = await supabase
    .from('registros_consumo')
    .insert(recordsToInsert)
    .select();

  if (insertError) {
    console.error('Error inserting seed records:', insertError);
    process.exit(1);
  }

  console.log(`Success! Inserted ${data.length} records into Supabase.`);
  console.log('----------------------------');
}

runSeed();
