export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const cleanObject = (obj: any) => {
    // return as-is if not an object
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
};

const SOCIAL_KEYS = new Set(['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok']);

// map UI profile -> DB payload (snake_case). Normalize socials keys into a single `socials` JSON.
export const mapProfileToDb = (p: any) => {
    if (!p || typeof p !== 'object') return p;
    const out: any = {};
    let socialsObj: any = {};

    Object.entries(p).forEach(([k, v]) => {
        // If user accidentally stored socials at top-level (instagram/tag etc.), collect them
        if (SOCIAL_KEYS.has(k)) {
            if (v) socialsObj[k] = v;
            return;
        }

        if (k === 'socials' && typeof v === 'object') {
            // merge explicit socials object
            Object.entries(v).forEach(([sk, sv]) => {
                if (sv !== undefined && sv !== null && sv !== '') socialsObj[sk] = sv;
            });
            return;
        }

        if (k === 'achievements' && Array.isArray(v)) {
            out[toSnake(k)] = JSON.stringify(v);
            return;
        }

        out[toSnake(k)] = v;
    });

    if (Object.keys(socialsObj).length) out['socials'] = socialsObj;
    return cleanObject(out);
};

export const mapEventToDb = (e: any) => {
    if (!e || typeof e !== 'object') return e;
    const out: any = {};
    Object.entries(e).forEach(([k, v]) => { out[toSnake(k)] = v; });
    return cleanObject(out);
};

export const mapHallToDb = (h: any) => {
    if (!h || typeof h !== 'object') return h;
    return cleanObject({
        id: h.id,
        athlete_name: h.athleteName,
        category: h.category,
        event_name: h.eventName,
        year: h.year,
        position: h.position,
        athlete_img: h.athleteImg,
        stat: h.stat,
        featured: h.featured
    });
};
