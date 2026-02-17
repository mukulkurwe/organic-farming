// backend/scripts/seedAgriCalendar.js
// Re-runnable seed: uses ON CONFLICT DO NOTHING / upsert logic
import pool from "../config/db.js";

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* =============================================
       1) SOIL PROFILES
    ============================================= */
    await client.query(`
      INSERT INTO soil_profiles (soil_type, ph_min, ph_max, npk_level, description) VALUES
        ('alluvial', 6.5, 7.5, 'high',   'Found in Indo-Gangetic plains. Very fertile, good for most crops.'),
        ('black',    7.0, 8.0, 'medium', 'Also called Regur soil. Rich in calcium, magnesium. Good for cotton and soybean.'),
        ('red',      5.5, 6.5, 'low',    'Found in Deccan plateau. Rich in iron, poor in nitrogen and phosphorus.'),
        ('sandy',    5.5, 7.0, 'low',    'Highly porous, low water retention. Good for groundnut and millets.'),
        ('loamy',    6.0, 7.0, 'medium', 'Balanced texture with sand, silt and clay. Ideal for most crops.')
      ON CONFLICT (soil_type) DO NOTHING;
    `);
    console.log("✅ Soil profiles seeded");

    /* =============================================
       2) CROPS (upsert by name)
    ============================================= */
    const crops = [
      {
        name: "Wheat",
        local_name: "Gehun",
        season: "Rabi",
        suitable_soils: ["alluvial", "loamy"],
        suitable_states: [
          "Punjab",
          "Haryana",
          "Uttar Pradesh",
          "Madhya Pradesh",
          "Rajasthan",
        ],
        min_rainfall_mm: 250,
        max_rainfall_mm: 600,
        min_temp_celsius: 10,
        max_temp_celsius: 25,
        duration_days: 120,
        water_requirement: "medium",
        irrigation_types: ["canal", "borewell", "drip"],
        description:
          "Major Rabi cereal crop. India is the second largest producer in the world.",
      },
      {
        name: "Rice",
        local_name: "Dhan / Chawal",
        season: "Kharif",
        suitable_soils: ["alluvial", "loamy"],
        suitable_states: [
          "West Bengal",
          "Uttar Pradesh",
          "Punjab",
          "Tamil Nadu",
          "Andhra Pradesh",
        ],
        min_rainfall_mm: 1000,
        max_rainfall_mm: 2000,
        min_temp_celsius: 20,
        max_temp_celsius: 37,
        duration_days: 150,
        water_requirement: "high",
        irrigation_types: ["canal", "borewell"],
        description:
          "Staple food crop of India. Requires standing water during growth.",
      },
      {
        name: "Maize",
        local_name: "Makka",
        season: "Kharif",
        suitable_soils: ["loamy", "red"],
        suitable_states: [
          "Karnataka",
          "Madhya Pradesh",
          "Bihar",
          "Rajasthan",
          "Maharashtra",
        ],
        min_rainfall_mm: 500,
        max_rainfall_mm: 1000,
        min_temp_celsius: 18,
        max_temp_celsius: 32,
        duration_days: 90,
        water_requirement: "medium",
        irrigation_types: ["drip", "borewell", "rainfed"],
        description:
          "Versatile Kharif crop used as food, fodder and industrial raw material.",
      },
      {
        name: "Soybean",
        local_name: "Soyabean",
        season: "Kharif",
        suitable_soils: ["black", "loamy"],
        suitable_states: [
          "Maharashtra",
          "Madhya Pradesh",
          "Rajasthan",
          "Karnataka",
        ],
        min_rainfall_mm: 600,
        max_rainfall_mm: 1000,
        min_temp_celsius: 20,
        max_temp_celsius: 35,
        duration_days: 100,
        water_requirement: "medium",
        irrigation_types: ["drip", "rainfed", "borewell"],
        description:
          "Important oilseed and protein crop. Fixes nitrogen in soil.",
      },
      {
        name: "Mustard",
        local_name: "Sarson",
        season: "Rabi",
        suitable_soils: ["alluvial", "loamy"],
        suitable_states: [
          "Rajasthan",
          "Uttar Pradesh",
          "Haryana",
          "Madhya Pradesh",
        ],
        min_rainfall_mm: 250,
        max_rainfall_mm: 500,
        min_temp_celsius: 10,
        max_temp_celsius: 25,
        duration_days: 110,
        water_requirement: "low",
        irrigation_types: ["rainfed", "borewell", "drip"],
        description: "Major Rabi oilseed crop. Requires cool dry weather.",
      },
      {
        name: "Chickpea",
        local_name: "Chana",
        season: "Rabi",
        suitable_soils: ["black", "loamy"],
        suitable_states: [
          "Madhya Pradesh",
          "Maharashtra",
          "Rajasthan",
          "Uttar Pradesh",
          "Karnataka",
        ],
        min_rainfall_mm: 200,
        max_rainfall_mm: 450,
        min_temp_celsius: 10,
        max_temp_celsius: 28,
        duration_days: 95,
        water_requirement: "low",
        irrigation_types: ["rainfed", "drip"],
        description:
          "Important pulse crop. Drought-tolerant, improves soil fertility.",
      },
      {
        name: "Groundnut",
        local_name: "Moongphali",
        season: "Kharif",
        suitable_soils: ["sandy", "red"],
        suitable_states: [
          "Gujarat",
          "Andhra Pradesh",
          "Tamil Nadu",
          "Karnataka",
          "Maharashtra",
        ],
        min_rainfall_mm: 500,
        max_rainfall_mm: 1000,
        min_temp_celsius: 22,
        max_temp_celsius: 35,
        duration_days: 130,
        water_requirement: "medium",
        irrigation_types: ["rainfed", "drip", "borewell"],
        description: "Major oilseed crop. Grows well in light sandy soils.",
      },
      {
        name: "Sunflower",
        local_name: "Surajmukhi",
        season: "Zaid",
        suitable_soils: ["loamy", "alluvial"],
        suitable_states: [
          "Karnataka",
          "Andhra Pradesh",
          "Maharashtra",
          "Tamil Nadu",
        ],
        min_rainfall_mm: 300,
        max_rainfall_mm: 700,
        min_temp_celsius: 18,
        max_temp_celsius: 35,
        duration_days: 90,
        water_requirement: "medium",
        irrigation_types: ["drip", "borewell", "canal"],
        description: "Short-duration oilseed crop suitable for Zaid season.",
      },
    ];

    for (const crop of crops) {
      await client.query(
        `INSERT INTO crops (name, local_name, season, suitable_soils, suitable_states,
            min_rainfall_mm, max_rainfall_mm, min_temp_celsius, max_temp_celsius,
            duration_days, water_requirement, irrigation_types, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (name) DO UPDATE SET
           local_name       = EXCLUDED.local_name,
           season           = EXCLUDED.season,
           suitable_soils   = EXCLUDED.suitable_soils,
           suitable_states  = EXCLUDED.suitable_states,
           min_rainfall_mm  = EXCLUDED.min_rainfall_mm,
           max_rainfall_mm  = EXCLUDED.max_rainfall_mm,
           min_temp_celsius = EXCLUDED.min_temp_celsius,
           max_temp_celsius = EXCLUDED.max_temp_celsius,
           duration_days    = EXCLUDED.duration_days,
           water_requirement= EXCLUDED.water_requirement,
           irrigation_types = EXCLUDED.irrigation_types,
           description      = EXCLUDED.description`,
        [
          crop.name,
          crop.local_name,
          crop.season,
          crop.suitable_soils,
          crop.suitable_states,
          crop.min_rainfall_mm,
          crop.max_rainfall_mm,
          crop.min_temp_celsius,
          crop.max_temp_celsius,
          crop.duration_days,
          crop.water_requirement,
          crop.irrigation_types,
          crop.description,
        ],
      );
    }
    console.log("✅ Crops seeded (8 crops)");

    /* =============================================
       3) TASK TEMPLATES (per crop)
    ============================================= */
    // Generic task stages — applied to every crop
    const taskStages = [
      {
        task_name: "Land Preparation",
        task_type: "land_prep",
        day_offset: -14,
        duration_hours: 8,
        priority: "high",
        input_required: "Tractor / Plough",
        quantity_per_acre: "1 pass",
        notes: "Plough and level the field. Remove weeds and debris.",
      },
      {
        task_name: "Seed Procurement",
        task_type: "resource_task",
        day_offset: -7,
        duration_hours: 2,
        priority: "critical",
        input_required: "Certified Seeds",
        quantity_per_acre: "varies",
        notes: "Purchase certified seeds from authorized dealer.",
      },
      {
        task_name: "Sowing",
        task_type: "sowing",
        day_offset: 0,
        duration_hours: 6,
        priority: "critical",
        input_required: "Seeds + Seed Drill",
        quantity_per_acre: "varies",
        notes: "Sow seeds at recommended depth and spacing.",
      },
      {
        task_name: "First Irrigation",
        task_type: "irrigation",
        day_offset: 3,
        duration_hours: 4,
        priority: "high",
        input_required: "Water",
        quantity_per_acre: "50mm",
        notes: "Light irrigation after sowing to ensure germination.",
      },
      {
        task_name: "Basal Fertilization",
        task_type: "fertilization",
        day_offset: 21,
        duration_hours: 3,
        priority: "high",
        input_required: "DAP Fertilizer",
        quantity_per_acre: "50 kg",
        notes: "Apply basal dose of DAP for root development.",
      },
      {
        task_name: "First Weeding",
        task_type: "crop_task",
        day_offset: 30,
        duration_hours: 6,
        priority: "medium",
        input_required: "Weeder / Manual labour",
        quantity_per_acre: "1 pass",
        notes: "Remove weeds to reduce competition for nutrients.",
      },
      {
        task_name: "Second Irrigation",
        task_type: "irrigation",
        day_offset: 35,
        duration_hours: 4,
        priority: "medium",
        input_required: "Water",
        quantity_per_acre: "50mm",
        notes: "Maintain soil moisture for vegetative growth.",
      },
      {
        task_name: "Top Dressing",
        task_type: "fertilization",
        day_offset: 45,
        duration_hours: 3,
        priority: "high",
        input_required: "Urea",
        quantity_per_acre: "30 kg",
        notes: "Apply urea top dressing for nitrogen boost.",
      },
      {
        task_name: "Pest Inspection",
        task_type: "pesticide",
        day_offset: 60,
        duration_hours: 2,
        priority: "medium",
        input_required: "Observation / Spray",
        quantity_per_acre: "as needed",
        notes: "Inspect for pest and disease symptoms. Spray if needed.",
      },
      {
        task_name: "Third Irrigation",
        task_type: "irrigation",
        day_offset: 70,
        duration_hours: 4,
        priority: "medium",
        input_required: "Water",
        quantity_per_acre: "50mm",
        notes: "Critical irrigation for grain filling stage.",
      },
    ];

    // Fetch all seeded crop IDs
    const cropRows = (
      await client.query(
        "SELECT id, name, duration_days FROM crops WHERE duration_days IS NOT NULL",
      )
    ).rows;

    for (const crop of cropRows) {
      // Delete calendar events referencing templates for this crop (re-runnability)
      await client.query(
        "DELETE FROM calendar_events WHERE task_template_id IN (SELECT id FROM crop_task_templates WHERE crop_id = $1)",
        [crop.id],
      );
      // Then delete existing templates
      await client.query("DELETE FROM crop_task_templates WHERE crop_id = $1", [
        crop.id,
      ]);

      for (const stage of taskStages) {
        await client.query(
          `INSERT INTO crop_task_templates
            (crop_id, task_name, task_type, day_offset, duration_hours, priority, notes, input_required, quantity_per_acre)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            crop.id,
            stage.task_name,
            stage.task_type,
            stage.day_offset,
            stage.duration_hours,
            stage.priority,
            stage.notes,
            stage.input_required,
            stage.quantity_per_acre,
          ],
        );
      }

      // Harvest task (uses crop-specific duration_days)
      await client.query(
        `INSERT INTO crop_task_templates
          (crop_id, task_name, task_type, day_offset, duration_hours, priority, notes, input_required, quantity_per_acre)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          crop.id,
          "Harvest",
          "harvest",
          crop.duration_days,
          8,
          "critical",
          "Harvest the crop at maturity. Check moisture content.",
          "Harvester / Sickle",
          "1 pass",
        ],
      );

      // Yield Logging task
      await client.query(
        `INSERT INTO crop_task_templates
          (crop_id, task_name, task_type, day_offset, duration_hours, priority, notes, input_required, quantity_per_acre)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          crop.id,
          "Yield Logging",
          "crop_task",
          crop.duration_days + 1,
          2,
          "low",
          "Record yield data. Weigh and store produce.",
          "Weighing Scale",
          "N/A",
        ],
      );
    }
    console.log("✅ Crop task templates seeded (12 per crop)");

    /* =============================================
       4) DUMMY FARMER PROFILE (Ramesh Patil)
    ============================================= */
    // Check if a user exists; if not, create one for the farmer
    let userId = null;
    const existingUser = await client.query(
      "SELECT id FROM users WHERE phone = '9999900001'",
    );
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const newUser = await client.query(
        "INSERT INTO users (name, phone, role, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [
          "Ramesh Patil",
          "9999900001",
          "farmer",
          "$2a$10$dummyhashedpasswordplaceholder",
        ],
      );
      userId = newUser.rows[0].id;
    }

    // Upsert farmer profile
    const farmerRes = await client.query(
      `
      INSERT INTO farmer_profiles (user_id, name, state, district, farm_size_acres, irrigation_type, soil_type)
      VALUES ($1, 'Ramesh Patil', 'Maharashtra', 'Nashik', 5.0, 'drip', 'black')
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        state = EXCLUDED.state,
        district = EXCLUDED.district,
        farm_size_acres = EXCLUDED.farm_size_acres,
        irrigation_type = EXCLUDED.irrigation_type,
        soil_type = EXCLUDED.soil_type
      RETURNING id
    `,
      [userId],
    );
    const farmerId = farmerRes.rows[0].id;
    console.log("✅ Farmer profile seeded (Ramesh Patil, id=" + farmerId + ")");

    /* =============================================
       5) CROP PLANS + CALENDAR EVENTS (multiple seasons)
    ============================================= */

    // Delete all existing events & plans for this farmer (re-runnability)
    await client.query("DELETE FROM calendar_events WHERE farmer_id = $1", [
      farmerId,
    ]);
    await client.query("DELETE FROM farmer_crop_plans WHERE farmer_id = $1", [
      farmerId,
    ]);

    // Color mapping
    const colorMap = {
      crop_task: "#22c55e",
      land_prep: "#22c55e",
      sowing: "#22c55e",
      harvest: "#22c55e",
      soil_task: "#a16207",
      soil_test: "#a16207",
      irrigation: "#3b82f6",
      weather_alert: "#3b82f6",
      fertilization: "#eab308",
      resource_task: "#eab308",
      pesticide: "#ef4444",
      risk_alert: "#ef4444",
    };

    function getEventType(taskType) {
      if (taskType === "irrigation") return "weather_alert";
      if (taskType === "fertilization") return "resource_task";
      if (taskType === "pesticide") return "risk_alert";
      if (taskType === "soil_test") return "soil_task";
      if (taskType === "resource_task") return "resource_task";
      return "crop_task";
    }

    const currentYear = new Date().getFullYear();

    // Three plans covering different seasons so events span the whole year:
    //  Rabi:  Wheat   sown Nov 1 previous year → events Oct–Mar
    //  Zaid:  Sunflower sown Feb 15 current year → events Feb–May
    //  Kharif: Soybean sown Jun 20 current year → events Jun–Oct
    const plans = [
      {
        cropName: "Wheat",
        season: "Rabi",
        sowingDate: `${currentYear - 1}-11-01`,
      },
      {
        cropName: "Sunflower",
        season: "Zaid",
        sowingDate: `${currentYear}-02-15`,
      },
      {
        cropName: "Soybean",
        season: "Kharif",
        sowingDate: `${currentYear}-06-20`,
      },
    ];

    let totalEvents = 0;

    for (const plan of plans) {
      const cropRow = (
        await client.query(
          "SELECT id, name, duration_days FROM crops WHERE name = $1",
          [plan.cropName],
        )
      ).rows[0];
      if (!cropRow) {
        console.log("⚠️  Crop not found: " + plan.cropName + ", skipping");
        continue;
      }

      const sowMs = new Date(plan.sowingDate).getTime();
      const harvestDate = new Date(sowMs + cropRow.duration_days * 86400000)
        .toISOString()
        .split("T")[0];

      const planRes = await client.query(
        `INSERT INTO farmer_crop_plans (farmer_id, crop_id, season, sowing_date, expected_harvest, status, notes)
         VALUES ($1, $2, $3, $4, $5, 'active', $6)
         RETURNING id`,
        [
          farmerId,
          cropRow.id,
          plan.season,
          plan.sowingDate,
          harvestDate,
          `Auto-generated plan for ${cropRow.name} ${plan.season} season`,
        ],
      );
      const planId = planRes.rows[0].id;

      // Fetch task templates for this crop
      const templates = (
        await client.query(
          "SELECT * FROM crop_task_templates WHERE crop_id = $1 ORDER BY day_offset",
          [cropRow.id],
        )
      ).rows;

      for (const t of templates) {
        const eventDate = new Date(sowMs + t.day_offset * 86400000)
          .toISOString()
          .split("T")[0];

        const eventType = getEventType(t.task_type);
        const eventColor = colorMap[t.task_type] || "#22c55e";

        await client.query(
          `INSERT INTO calendar_events
            (farmer_id, plan_id, crop_id, task_template_id, event_title, event_type, event_date, event_color, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            farmerId,
            planId,
            cropRow.id,
            t.id,
            `${t.task_name} — ${cropRow.name}`,
            eventType,
            eventDate,
            eventColor,
            t.notes,
          ],
        );
        totalEvents++;
      }

      console.log(
        `✅ Plan seeded: ${cropRow.name} (${plan.season}), sowing=${plan.sowingDate}, ${templates.length} events`,
      );
    }

    console.log(`✅ Total calendar events generated: ${totalEvents}`);

    await client.query("COMMIT");
    console.log("🎉 Agri Calendar seed completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
