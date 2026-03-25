import { createContext, useContext, useState, useCallback } from 'react';
import { tourRow, maxMembers, DEMO_MODE } from '../data/businessData';

const Ctx = createContext(null);

// ══════════════════════════════════════════════════════════════
//  CONSTELLATION STATE
// ══════════════════════════════════════════════════════════════
function newConstellation(id, type, pseudo, alcyonePseudo) {
  return {
    id,
    type,
    name: type === 'triangulum' ? 'Triangulum' : 'Pléiade',
    pseudo: pseudo || '',            // §1: unique pseudo for this constellation
    alcyonePseudo: alcyonePseudo || '', // §1: alcyone (parrain) pseudo
    tour: 1,
    paidMembers: [],
    maxMembers: maxMembers(type),
    cumulVersees: 21,
    contributionsRecues: 0,
    soldeDisponible: 0,
    paiementEffectue: false,
    tourComplet: false,
    constellationTerminee: false,
    initialPaid: false,
  };
}

// ══════════════════════════════════════════════════════════════
//  PROVIDER
// ══════════════════════════════════════════════════════════════
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [constellations, setConstellations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [authed, setAuthed] = useState(false);

  const save = useCallback((u, cs, aid) => {
    localStorage.setItem('7e', JSON.stringify({ user: u, constellations: cs, activeId: aid }));
  }, []);

  const load = useCallback(() => {
  try {
    const raw = localStorage.getItem('7e');
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d.user) return false;

    // Ici, on met les setUser et setAuthed, mais après tout le reste
    setAuthed(true);
    setUser(d.user);

    // Migration des constellations
    const migrated = (d.constellations || []).map(c => ({
      ...c,
      pseudo: c.pseudo || '',
      alcyonePseudo: c.alcyonePseudo || '',
      contributionsRecues: c.contributionsRecues ?? c.recuTourCourant ?? 0,
      cumulVersees: c.cumulVersees ?? 21,
      soldeDisponible: c.soldeDisponible ?? 0,
      paiementEffectue: c.paiementEffectue ?? false,
      tourComplet: c.tourComplet ?? false,
      constellationTerminee: c.constellationTerminee ?? false,
      paidMembers: c.paidMembers ?? [],
      maxMembers: c.maxMembers ?? maxMembers(c.type),
      initialPaid: c.initialPaid ?? false,
    }));
    setConstellations(migrated);
    setActiveId(d.activeId || migrated[0]?.id || null);

    const tRaw = localStorage.getItem('7e_testimonials');
    if (tRaw) setTestimonials(JSON.parse(tRaw));
    return true;
  } catch {
    return false;
  }
}, []);

  // §3: Check pseudo uniqueness (case-insensitive, trimmed)
  const isPseudoTaken = useCallback((pseudo) => {
    const normalized = pseudo.trim().toLowerCase();
    // Check against locally stored known pseudos
    try {
      const raw = localStorage.getItem('7e_pseudos');
      const list = raw ? JSON.parse(raw) : [];
      return list.includes(normalized);
    } catch { return false; }
  }, []);

  const register = useCallback((form) => {
    const normalized = form.pseudo.trim().toLowerCase();

    // §3: Block if pseudo already taken
    if (isPseudoTaken(form.pseudo)) {
      return { error: 'pseudo_taken' };
    }

    const u = {
      pseudo: form.pseudo.trim(), prenom: form.prenom, nom: form.nom,
      email: form.email, pays: form.pays, paiement: form.paiement,
      alcyone: form.alcyone || '',
    };
    const c = newConstellation('c1', form.option, u.pseudo, u.alcyone);
    setUser(u);
    setConstellations([c]);
    setActiveId('c1');
    save(u, [c], 'c1');

    // §3: Store pseudo in global registry
    try {
      const raw = localStorage.getItem('7e_pseudos');
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(normalized)) {
        list.push(normalized);
        localStorage.setItem('7e_pseudos', JSON.stringify(list));
      }
    } catch {}

    return c;
  }, [save, isPseudoTaken]);

  const payInitial = useCallback((constId) => {
    setConstellations(prev => {
      const next = prev.map(c =>
        c.id === constId ? { ...c, initialPaid: true } : c
      );
      if (next.some(c => c.initialPaid)) setAuthed(true);
      save(user, next, activeId);
      return next;
    });
  }, [user, activeId, save]);

  const createNewConstellation = useCallback((type, pseudo, alcyonePseudo) => {
    const id = 'c' + (constellations.length + 1) + '-' + Date.now();
    const c = newConstellation(id, type, pseudo, alcyonePseudo);
    // §3: Register pseudo in global registry
    if (pseudo) {
      try {
        const raw = localStorage.getItem('7e_pseudos');
        const list = raw ? JSON.parse(raw) : [];
        const norm = pseudo.trim().toLowerCase();
        if (!list.includes(norm)) {
          list.push(norm);
          localStorage.setItem('7e_pseudos', JSON.stringify(list));
        }
      } catch {}
    }
    const next = [...constellations, c];
    setConstellations(next);
    setActiveId(id);
    save(user, next, id);
    return c;
  }, [constellations, user, save]);

  // ══════════════════════════════════════════════════════════════
  //  §4: JOIN AN EXISTING CONSTELLATION (from search)
  //  Payment already validated before this is called.
  // ══════════════════════════════════════════════════════════════
  const joinConstellation = useCallback((searchResult, pseudo, alcyonePseudo) => {
    const id = 'j' + Date.now();
    const type = searchResult.max === 3 ? 'triangulum' : 'pleiade';
    const c = {
      ...newConstellation(id, type, pseudo || user?.pseudo, alcyonePseudo || ''),
      initialPaid: true,
      joinedFrom: searchResult.owner,
      joinedPays: searchResult.pays,
    };
    const next = [...constellations, c];
    setConstellations(next);
    setActiveId(id);
    save(user, next, id);
    return c;
  }, [constellations, user, save]);

  // ══════════════════════════════════════════════════════════════
  //  INCOMING PAYMENT (member pays user)
  //
  //  §1 HARD CAP: max 3 members per tour. If already 3 → BLOCKED.
  //  §2 POST-PAYMENT ROUTING: if user already paid (paiementEffectue),
  //     any late incoming payment goes DIRECTLY to soldeDisponible,
  //     NOT to contributionsRecues.
  //  §3 CONSTELLATION TERMINÉE: if constellationTerminee → blocked.
  // ══════════════════════════════════════════════════════════════
  const simulateIncomingPayment = useCallback((constId, memberPseudo, memberPays, amount) => {
    setConstellations(prev => {
      const next = prev.map(c => {
        if (c.id !== constId) return c;

        // §3: Constellation terminée → hard block
        if (c.constellationTerminee) return c;

        // §1: Hard cap — already 3 members this tour → block
        if (c.paidMembers.length >= c.maxMembers) return c;

        // Guard: reject undefined or empty pseudos
        if (!memberPseudo) return c;

        // Check if this is a new member or existing
        const isNew = !c.paidMembers.find(m => m.pseudo === memberPseudo);

        // §1: If adding a new member would exceed 3 → block
        if (isNew && c.paidMembers.length >= c.maxMembers) return c;

        const updated = { ...c };

        // Add member to circles if new
        if (isNew) {
          updated.paidMembers = [...updated.paidMembers, { pseudo: memberPseudo, pays: memberPays }];
        }

        // §2: Route money based on tour state
        const row = tourRow(updated.type, updated.tour);
        if (row.prochain === null) {
          // Tour 7 (FIN): no outgoing payment, money goes directly to solde
          updated.soldeDisponible += amount;
        } else if (updated.paiementEffectue) {
          // User already contributed this tour → late payment goes to solde
          updated.soldeDisponible += amount;
        } else {
          // Normal: goes to contributionsRecues
          updated.contributionsRecues += amount;
        }

        // Check tour complete (3/3)
        updated.tourComplet = updated.paidMembers.length >= updated.maxMembers;

        // Try to advance tour
        return tryAdvanceTour(updated);
      });
      save(user, next, activeId);
      return next;
    });
  }, [user, activeId, save]);

  // ══════════════════════════════════════════════════════════════
  //  USER PAYS OUT ("Faire ma contribution")
  //
  //  Active when: contributionsRecues >= prochaineContribution
  //  On payment:
  //    - contributionsRecues → 0 (always)
  //    - surplus → soldeDisponible
  //    - cumulVersees += prochaineContribution
  //    - paiementEffectue = true
  //  Then try to advance tour.
  // ══════════════════════════════════════════════════════════════
  const payCurrentTour = useCallback((constId) => {
    setConstellations(prev => {
      const next = prev.map(c => {
        if (c.id !== constId) return c;
        if (c.paiementEffectue) return c;
        if (c.constellationTerminee) return c;

        const row = tourRow(c.type, c.tour);
        if (row.prochain === null) return c; // tour 7, nothing to pay

        if (c.contributionsRecues < row.prochain) return c;

        const updated = { ...c };
        const excess = updated.contributionsRecues - row.prochain;

        updated.cumulVersees += row.prochain;
        updated.contributionsRecues = 0;       // §2: ALWAYS resets to 0
        updated.soldeDisponible += excess;      // surplus to solde
        updated.paiementEffectue = true;

        return tryAdvanceTour(updated);
      });
      save(user, next, activeId);
      return next;
    });
  }, [user, activeId, save]);

  // ══════════════════════════════════════════════════════════════
  //  TOUR ADVANCEMENT
  //
  //  Tours 1-6: advance when paiementEffectue AND tourComplet (3/3)
  //  Tour 7: no outgoing payment → constellationTerminee when tourComplet
  // ══════════════════════════════════════════════════════════════
  function tryAdvanceTour(c) {
    // §3: Tour 7 special — no payment, just need 3/3
    if (c.tour >= 7 && c.tourComplet) {
      return { ...c, constellationTerminee: true };
    }
    // Tours 1-6: both conditions
    if (!c.paiementEffectue || !c.tourComplet) return c;
    return {
      ...c,
      tour: c.tour + 1,
      paidMembers: [],
      paiementEffectue: false,
      tourComplet: false,
    };
  }

  const selectConstellation = useCallback((id) => {
    setActiveId(id);
    save(user, constellations, id);
  }, [user, constellations, save]);

  const logout = useCallback(() => {
    localStorage.removeItem('7e');
    setUser(null); setConstellations([]); setActiveId(null); setAuthed(false);
  }, []);

  const submitTestimonial = useCallback((message, anonymous, allowPublish) => {
    const t = {
      id: Date.now(),
      pseudo: anonymous ? 'Anonyme' : user?.pseudo,
      message, allowPublish,
      status: 'pending',
      date: new Date().toISOString(),
    };
    const next = [...testimonials, t];
    setTestimonials(next);
    localStorage.setItem('7e_testimonials', JSON.stringify(next));
  }, [user, testimonials]);

  // ══════════════════════════════════════════════════════════════
  //  DERIVED STATE
  // ══════════════════════════════════════════════════════════════
  const active = constellations.find(c => c.id === activeId) || constellations[0] || null;
  // §1+§3: Count only active AND non-terminated constellations
  const triCount = constellations.filter(c => c.type === 'triangulum' && c.initialPaid && !c.constellationTerminee).length;
  const pleCount = constellations.filter(c => c.type === 'pleiade' && c.initialPaid && !c.constellationTerminee).length;
  const hasAccess = authed && constellations.some(c => c.initialPaid);

  const stats = active ? (() => {
    const row = tourRow(active.type, active.tour);
    const finContribution = row.prochain === null;
    const finConstellation = active.constellationTerminee;
    return {
      contributionsVersees: active.cumulVersees,
      contributionsRecues: active.contributionsRecues,
      prochaineContribution: row.prochain,
      soldeDisponible: active.soldeDisponible,
      paiementEffectue: active.paiementEffectue,
      tourComplet: active.tourComplet,
      finContribution,
      finConstellation,
    };
  })() : {
    contributionsVersees: 0, contributionsRecues: 0,
    prochaineContribution: 21, soldeDisponible: 0,
    paiementEffectue: false, tourComplet: false,
    finContribution: false, finConstellation: false,
  };

  const canPay = active
    && !active.paiementEffectue
    && !active.constellationTerminee
    && stats.prochaineContribution !== null
    && stats.contributionsRecues >= stats.prochaineContribution;

  return (
    <Ctx.Provider value={{
      user, constellations, active, activeId, stats, canPay, hasAccess,
      triCount, pleCount, testimonials,
      load, register, isPseudoTaken, payInitial, createNewConstellation,
      simulateIncomingPayment, payCurrentTour, joinConstellation,
      selectConstellation, logout, submitTestimonial,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}
