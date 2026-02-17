// backend/services/calendarGenerator.js
import pool from "../config/db.js";

/**
 * Color mapping for event types
 */
const COLOR_MAP = {
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

/**
 * Map task_type to a broad event_type category
 */
function getEventType(taskType) {
  if (["irrigation"].includes(taskType)) return "weather_alert";
  if (["fertilization"].includes(taskType)) return "resource_task";
  if (["pesticide"].includes(taskType)) return "risk_alert";
  if (["soil_test"].includes(taskType)) return "soil_task";
  if (["resource_task"].includes(taskType)) return "resource_task";
  return "crop_task";
}

/**
 * Generate a crop plan and all calendar events from task templates.
 *
 * @param {object} params
 * @param {number} params.farmer_id    - farmer_profiles.id
 * @param {number} params.crop_id      - crops.id
 * @param {string} params.sowing_date  - YYYY-MM-DD
 * @returns {Promise<object>} { plan, events }
 */
export async function generateCalendar({ farmer_id, crop_id, sowing_date }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Fetch crop details
    const cropRes = await client.query(
      "SELECT id, name, season, duration_days FROM crops WHERE id = $1",
      [crop_id],
    );
    if (cropRes.rows.length === 0) {
      throw new Error("Crop not found");
    }
    const crop = cropRes.rows[0];

    // 2) Calculate expected harvest date
    const sowingMs = new Date(sowing_date).getTime();
    const harvestDate = new Date(sowingMs + crop.duration_days * 86400000)
      .toISOString()
      .split("T")[0];

    // 3) Create farmer_crop_plan
    const planRes = await client.query(
      `INSERT INTO farmer_crop_plans
        (farmer_id, crop_id, season, sowing_date, expected_harvest, status, notes)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       RETURNING *`,
      [
        farmer_id,
        crop_id,
        crop.season || "Unknown",
        sowing_date,
        harvestDate,
        `Auto-generated plan for ${crop.name}`,
      ],
    );
    const plan = planRes.rows[0];

    // 4) Fetch all task templates for this crop
    const templates = (
      await client.query(
        "SELECT * FROM crop_task_templates WHERE crop_id = $1 ORDER BY day_offset",
        [crop_id],
      )
    ).rows;

    // 5) Generate calendar events
    const events = [];
    for (const t of templates) {
      const eventDate = new Date(sowingMs + t.day_offset * 86400000)
        .toISOString()
        .split("T")[0];

      const eventType = getEventType(t.task_type);
      const eventColor = COLOR_MAP[t.task_type] || "#22c55e";

      const evRes = await client.query(
        `INSERT INTO calendar_events
          (farmer_id, plan_id, crop_id, task_template_id, event_title, event_type, event_date, event_color, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          farmer_id,
          plan.id,
          crop_id,
          t.id,
          `${t.task_name} — ${crop.name}`,
          eventType,
          eventDate,
          eventColor,
          t.notes,
        ],
      );
      events.push(evRes.rows[0]);
    }

    await client.query("COMMIT");

    return { plan, events };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
