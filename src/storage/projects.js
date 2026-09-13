import { Directory, File, Paths } from "expo-file-system";

/**
 * Persistent storage for tracing "projects".
 *
 * A project captures everything needed to resume a tracing session:
 *   - the reference image (copied into durable storage so it survives even if
 *     the picker's cache is cleared)
 *   - the overlay transform (position / scale / rotation)
 *   - opacity and horizontal flip
 *
 * Implemented with the object-based expo-file-system API (SDK 54+):
 *   Paths.document -> Directory  (survives app restarts, unlike the cache)
 *   new File(dir, name).write()/.textSync()/.copy()/.delete()
 *
 * All functions fail soft: on any I/O error they log and return a safe value
 * rather than throwing, so a storage hiccup never crashes the UI.
 */

const DB_FILENAME = "projects.json";
const IMAGES_DIRNAME = "project-images";

function dbFile() {
  return new File(Paths.document, DB_FILENAME);
}

function imagesDir() {
  const dir = new Directory(Paths.document, IMAGES_DIRNAME);
  if (!dir.exists) {
    dir.create({ idempotent: true });
  }
  return dir;
}

/** Generate a reasonably unique id for a new project. */
export function newProjectId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Load all saved projects, newest first. Returns [] if none / on error. */
export async function loadProjects() {
  try {
    const f = dbFile();
    if (!f.exists) return [];
    const text = f.textSync();
    const data = JSON.parse(text || "[]");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("[projects] loadProjects failed:", e);
    return [];
  }
}

async function persist(projects) {
  const f = dbFile();
  if (!f.exists) {
    f.create();
  }
  await f.write(JSON.stringify(projects));
}

/**
 * Copy the reference image into durable per-project storage (once), returning
 * the durable URI. If the image already lives in our folder, it's left as is.
 */
async function ensureDurableImage(id, imageUri) {
  if (!imageUri) return imageUri;
  const dir = imagesDir();
  const dest = new File(dir, `${id}.jpg`);

  // Already durable? Nothing to copy.
  if (
    imageUri === dest.uri ||
    imageUri.includes(`${IMAGES_DIRNAME}/${id}.jpg`)
  ) {
    return dest.exists ? dest.uri : imageUri;
  }

  try {
    if (dest.exists) dest.delete();
    const src = new File(imageUri);
    await src.copy(dest);
    return dest.uri;
  } catch (e) {
    // Fall back to the original URI — still valid for the current session.
    console.warn("[projects] image copy failed, using original uri:", e);
    return imageUri;
  }
}

/**
 * Create or update a project. Pass an existing `id` to update in place.
 *
 * @param {object} p
 * @param {string} p.id
 * @param {string} p.name
 * @param {string} p.imageUri
 * @param {{tx:number,ty:number,scale:number,rot:number}} p.transform
 * @param {number} p.opacity
 * @param {boolean} p.flipped
 * @returns {Promise<object|null>} the saved record, or null on failure
 */
export async function saveProject({
  id,
  name,
  imageUri,
  transform,
  opacity,
  flipped,
}) {
  try {
    const projects = await loadProjects();
    const now = Date.now();
    const durableImageUri = await ensureDurableImage(id, imageUri);

    const existingIndex = projects.findIndex((p) => p.id === id);
    const record = {
      id,
      name: (name && name.trim()) || "Untitled",
      imageUri: durableImageUri,
      transform: transform || { tx: 0, ty: 0, scale: 1, rot: 0 },
      opacity: typeof opacity === "number" ? opacity : 0.5,
      flipped: !!flipped,
      createdAt: existingIndex >= 0 ? projects[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = record;
    } else {
      projects.unshift(record);
    }
    await persist(projects);
    return record;
  } catch (e) {
    console.warn("[projects] saveProject failed:", e);
    return null;
  }
}

/** Delete a project (and its stored image). Returns the remaining projects. */
export async function deleteProject(id) {
  try {
    const projects = await loadProjects();
    const next = projects.filter((p) => p.id !== id);

    try {
      const img = new File(imagesDir(), `${id}.jpg`);
      if (img.exists) img.delete();
    } catch (e) {
      console.warn("[projects] image delete failed:", e);
    }

    await persist(next);
    return next;
  } catch (e) {
    console.warn("[projects] deleteProject failed:", e);
    return null;
  }
}
