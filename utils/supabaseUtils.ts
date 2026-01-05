export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const cleanObject = (obj: any) => {
    // remove undefined / null / empty strings
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
};

// map a profile from UI shape -> DB shape (snake_case, flatten socials, stringify arrays)
export const mapProfileToDb = (p: any) => {
    if (!p || typeof p !== 'object') return p;
    const out: any = {};
    Object.entries(p).forEach(([k, v]) => {
        if (k === 'socials' && typeof v === 'object') {
            // flatten socials into separate columns if present
            Object.entries(v).forEach(([sk, sv]) => {
                out[toSnake(sk)] = sv;
            });
        } else if (k === 'achievements' && Array.isArray(v)) {
            out[toSnake(k)] = JSON.stringify(v);
        } else {
            out[toSnake(k)] = v;
        }
    });
    return cleanObject(out);
};

export const mapEventToDb = (e: any) => {
    if (!e || typeof e !== 'object') return e;
    const out: any = {};
    Object.entries(e).forEach(([k, v]) => {
        if (k === 'score_schema' && Array.isArray(v)) {
            out[toSnake(k)] = v; // assume DB column is jsonb
        } else {
            out[toSnake(k)] = v;
        }
    });
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
