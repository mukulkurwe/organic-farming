// backend/scripts/seedSampleData.js
// One-time seed: adds a demo farmer, farms, zones, workers, inputs
import pool from "../config/db.js";

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Demo user
    await client.query(`
      INSERT INTO users (name, phone, role)
      VALUES ('Demo Farmer', '9999999999', 'farmer')
      ON CONFLICT (phone) DO NOTHING;
    `);
    const { rows: [user] } = await client.query(
      `SELECT id FROM users WHERE phone = '9999999999'`
    );
    const userId = user.id;
    console.log("✅ User ready, id =", userId);

    // 2. Farms
    await client.query(`
      INSERT INTO farms (name, location, owner_id)
      VALUES
        ('Green Valley Farm', 'Nashik, Maharashtra', $1),
        ('Sunrise Organic Farm', 'Indore, Madhya Pradesh', $1)
      ON CONFLICT DO NOTHING;
    `, [userId]);
    const { rows: farms } = await client.query(`SELECT id, name FROM farms WHERE owner_id = $1 ORDER BY id`, [userId]);
    console.log("✅ Farms seeded:", farms.map(f => f.name).join(", "));

    // 3. Zones for each farm
    for (const farm of farms) {
      const existing = await client.query(`SELECT count(*)::int as cnt FROM zones WHERE farm_id = $1`, [farm.id]);
      if (existing.rows[0].cnt === 0) {
        await client.query(`
          INSERT INTO zones (farm_id, name, area) VALUES
            ($1, 'Zone A - North Field', 2.5),
            ($1, 'Zone B - South Field', 3.0),
            ($1, 'Zone C - Orchard', 1.2);
        `, [farm.id]);
      }
    }
    console.log("✅ Zones seeded");

    // 4. Workers for each farm
    for (const farm of farms) {
      const existing = await client.query(`SELECT count(*)::int as cnt FROM workers WHERE farm_id = $1`, [farm.id]);
      if (existing.rows[0].cnt === 0) {
        await client.query(`
          INSERT INTO workers (farm_id, name, phone) VALUES
            ($1, 'Ramesh Kumar', '9876543210'),
            ($1, 'Sunita Devi', '9876543211'),
            ($1, 'Anil Patel', '9876543212');
        `, [farm.id]);
      }
    }
    console.log("✅ Workers seeded");

    // 5. Inputs (master table)
    await client.query(`
      INSERT INTO inputs (name, type, unit_default) VALUES
        ('Vermicompost',      'fertilizer', 'kg'),
        ('Neem Oil',          'pesticide',  'ml'),
        ('Cow Dung Manure',   'fertilizer', 'kg'),
        ('Panchagavya',       'biofertilizer', 'L'),
        ('Jeevamrut',         'biofertilizer', 'L'),
        ('Wheat Seeds',       'seed',       'kg'),
        ('Rice Seeds',        'seed',       'kg'),
        ('Drip Irrigation',   'water',      'hrs')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Inputs seeded");

    await client.query("COMMIT");
    console.log("\n🎉 All sample data seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
