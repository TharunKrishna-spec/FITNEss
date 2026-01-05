export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const cleanObject = (obj: any) => {
    // return as-is if not an object
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
};

export const mapProfileToDb = (p: any) => {
    if (!p || typeof p !== 'object') return p;
    const out: any = {};
    Object.entries(p).forEach(([k, v]) => {
        if (k === 'socials') {
            // keep socials as a JSON object under `socials` column
            if (v && typeof v === 'object') out['socials'] = cleanObject(v);
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
        out[toSnake(k)] = v;
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
