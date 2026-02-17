// backend/services/cropRecommendationEngine.js
import pool from "../config/db.js";

/**
 * Recommend crops based on farmer profile inputs.
 *
 * Logic:
 * 1. Query all crops that have calendar data (duration_days IS NOT NULL)
 * 2. Filter by: season match, soil_type in suitable_soils, irrigation_type in irrigation_types
 * 3. Score / rank: +10 if state matches suitable_states, +5 if soil is first preference
 * 4. Return sorted array (highest score first)
 *
 * @param {object} params
 * @param {string} params.soil_type  - e.g. 'black'
 * @param {string} params.season     - e.g. 'Kharif'
 * @param {string} params.irrigation_type - e.g. 'drip'
 * @param {string} [params.state]    - e.g. 'Maharashtra'
 * @returns {Promise<Array>} ranked crop list
 */
export async function recommendCrops({
  soil_type,
  season,
  irrigation_type,
  state,
}) {
  // Fetch all crops that have been extended with calendar columns
  const result = await pool.query(`
    SELECT id, name, local_name, season, suitable_soils, suitable_states,
           min_rainfall_mm, max_rainfall_mm, min_temp_celsius, max_temp_celsius,
           duration_days, water_requirement, irrigation_types, description, image_url
    FROM crops
    WHERE duration_days IS NOT NULL
  `);

  let crops = result.rows;

  // Filter by season (case-insensitive)
  if (season) {
    crops = crops.filter(
      (c) => c.season && c.season.toLowerCase() === season.toLowerCase(),
    );
  }

  // Filter by soil_type — must be in suitable_soils array
  if (soil_type) {
    crops = crops.filter(
      (c) =>
        c.suitable_soils &&
        c.suitable_soils
          .map((s) => s.toLowerCase())
          .includes(soil_type.toLowerCase()),
    );
  }

  // Filter by irrigation_type — must be compatible
  if (irrigation_type) {
    crops = crops.filter(
      (c) =>
        c.irrigation_types &&
        c.irrigation_types
          .map((i) => i.toLowerCase())
          .includes(irrigation_type.toLowerCase()),
    );
  }

  // Score & rank
  const scored = crops.map((crop) => {
    let score = 50; // base score

    // +10 if state is in suitable_states
    if (
      state &&
      crop.suitable_states &&
      crop.suitable_states
        .map((s) => s.toLowerCase())
        .includes(state.toLowerCase())
    ) {
      score += 10;
    }

    // +5 if soil is first in the suitable_soils list (primary preference)
    if (
      soil_type &&
      crop.suitable_soils &&
      crop.suitable_soils.length > 0 &&
      crop.suitable_soils[0].toLowerCase() === soil_type.toLowerCase()
    ) {
      score += 5;
    }

    // +3 for low water requirement (resource efficiency)
    if (crop.water_requirement === "low") score += 3;

    // +2 for shorter duration (faster returns)
    if (crop.duration_days <= 100) score += 2;

    return { ...crop, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored;
}
