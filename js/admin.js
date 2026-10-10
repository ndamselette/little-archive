(() => {
    const SUPABASE_URL = 'https://fdqctimtqehetboszlbg.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_gHfal4nlxw_5j67FTmV_0w_hIzRMjLu';
  const configured = /^https:\/\//.test(SUPABASE_URL) && !SUPABASE_URL.includes('YOUR_') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_');
  const $ = (id) => document.getElementById(id);
  const sectionNames = {movies:'Movies, series & books',ships:'Ships & dynamics',songs:'Songs',hobbies:'Hobbies & interests'};
  let client = null, entries = [], guestbookNotes = [];
  const defaultImages = {
    movies: { Movie:'assets/images/archive/movies/1.png', Series:'assets/images/archive/movies/1.png', Book:'assets/images/archive/books/1.png' },
    ships:'assets/images/archive/ships/1.png',
    hobbies:'assets/images/archive/hobbies/1.png'
  };
  function defaultImage(section, type) {
    return section === 'movies' ? (defaultImages.movies[type] || defaultImages.movies.Movie) : (defaultImages[section] || '');
  }
  function setImagePreview() {
    const path=$('entryImage').value.trim();
    const img=$('entryImagePreview'), statusEl=$('imagePreviewStatus');
    if(!path){img.hidden=true;statusEl.textContent='No picture path set.';return;}
    img.hidden=false;
    img.onerror=()=>{img.hidden=true;statusEl.textContent='Image not found. Check the path and filename.';};
    img.onload=()=>{statusEl.textContent='Picture preview loaded.';};
    img.src=path;
  }
  function syncStructuredFieldsFromMetadata(metadata={}, section=$('section').value) {
    const media=section==='movies';
    $('typeField').hidden=!media;
    $('yearField').hidden=!media;
    $('creatorField').hidden=!media;
    $('genreField').hidden=!(media||section==='ships');
    $('kindField').hidden=!(section==='ships'||section==='hobbies');
    $('categoryField').hidden=section!=='hobbies';
    $('shipFields').hidden=section!=='ships';
    $('songFields').hidden=section!=='songs';
    $('imageField').hidden=section==='songs';
    $('imagePreviewWrap').hidden=section==='songs';
    $('entryType').value=['Movie','Series','Book'].includes(metadata.type)?metadata.type:'Movie';
    $('creatorLabel').textContent=$('entryType').value==='Book'?'Author':'Director';
    $('entryYear').value=metadata.year ?? '';
    $('entryCreator').value=$('entryType').value==='Book'?(metadata.author||''):(metadata.director||metadata.author||'');
    $('entryKind').value=metadata.kind || (section==='ships'?'Ship':'Hobby');
    $('entryCategory').value=metadata.category || '';
    $('entryFandom').value=metadata.fandom || '';
    $('entryCharacters').value=metadata.characters || '';
    $('entryArtist').value=metadata.artist || '';
    $('entryAudio').value=metadata.src || '';
    $('entryMood').value=metadata.mood || '';
    $('entryUrl').value=metadata.url || '';
    const terms=section==='ships'?(metadata.tropes||[]):(metadata.genres||[]);
    $('entryGenres').value=Array.isArray(terms)?terms.join(', '):'';
    $('entryImage').value=section==='songs'?'':(metadata.image_path || defaultImage(section,$('entryType').value));
    setImagePreview();
  }
  function buildMetadata(existing={}) {
    const section=$('section').value;
    const metadata={...existing};
    if(section==='movies'){
      const type=$('entryType').value;
      metadata.type=type;
      metadata.year=$('entryYear').value?Number($('entryYear').value):'';
      delete metadata.author; delete metadata.director;
      if($('entryCreator').value.trim()) metadata[type==='Book'?'author':'director']=$('entryCreator').value.trim();
      metadata.genres=$('entryGenres').value.split(',').map(x=>x.trim()).filter(Boolean);
      metadata.image_path=$('entryImage').value.trim() || defaultImage(section,type);
      metadata.emoji=type==='Book'?'📚':(metadata.emoji||'🎬');
      metadata.color=metadata.color||'poster-rose';
    } else if(section==='ships'){
      metadata.kind=$('entryKind').value;
      metadata.fandom=$('entryFandom').value.trim();
      metadata.characters=$('entryCharacters').value.trim();
      metadata.tropes=$('entryGenres').value.split(',').map(x=>x.trim()).filter(Boolean);
      metadata.image_path=$('entryImage').value.trim()||defaultImage(section);
      metadata.emoji=metadata.emoji||'💌';
    } else if(section==='songs'){
      metadata.artist=$('entryArtist').value.trim();
      metadata.src=$('entryAudio').value.trim();
      metadata.mood=$('entryMood').value.trim();
      metadata.url=$('entryUrl').value.trim();
      delete metadata.image_path;
      metadata.emoji=metadata.emoji||'♫';
    } else if(section==='hobbies'){
      metadata.kind=$('entryKind').value;
      metadata.category=$('entryCategory').value.trim()||'Others';
      metadata.image_path=$('entryImage').value.trim()||defaultImage(section);
      metadata.emoji=metadata.emoji||'✿';
    }
    return metadata;
  }
  function status(id, message, kind='') { const el=$(id); el.textContent=message; el.className=`status ${kind}`.trim(); }
  function setLoggedIn(user) { $('loginCard').hidden=!!user; $('dashboard').hidden=!user; }
  function resetForm() { $('entryForm').reset(); $('entryId').value=''; $('sortOrder').value='0'; $('published').checked=true; syncStructuredFieldsFromMetadata({},$('section').value); $('formHeading').textContent='Add an entry'; $('saveEntry').textContent='Save entry ♡'; $('cancelEdit').hidden=true; status('formStatus',''); }
  function updateMetadataHelp() { if(!$('entryId').value) syncStructuredFieldsFromMetadata({},$('section').value); else { const entry=entries.find(x=>x.id===$('entryId').value); syncStructuredFieldsFromMetadata(entry?.metadata||{},$('section').value); } }
  async function loadEntries() {
    status('listStatus','Loading entries…');
    const {data,error}=await client.from('archive_entries').select('*').order('section').order('sort_order').order('created_at',{ascending:false});
    if(error) { status('listStatus',error.message,'error'); return; }
    entries=data||[]; renderEntries(); status('listStatus',`${entries.length} ${entries.length===1?'entry':'entries'} loaded.`);
  }
  async function loadGuestbook() {
    status('guestbookAdminStatus','Loading guestbook notes…');
    const {data,error}=await client.from('guestbook').select('id,name,category,message,tags,status,created_at').order('created_at',{ascending:false});
    if(error) { status('guestbookAdminStatus',`Could not load guestbook notes: ${error.message}`,'error'); return; }
    guestbookNotes=data||[];
    renderGuestbook();
  }
  function renderGuestbook() {
    const query=$('guestbookSearch').value.trim().toLowerCase();
    const filter=$('guestbookStatusFilter').value;
    const shown=guestbookNotes.filter(n=>(filter==='all'||n.status===filter)&&(!query||[n.name,n.category,n.message,(n.tags||[]).join(' ')].join(' ').toLowerCase().includes(query)));
    $('guestbookList').innerHTML=shown.length?shown.map(n=>`<article class="entry-item guestbook-item"><div><div class="entry-meta">${esc(n.category)} · ${esc(new Date(n.created_at).toLocaleString())}<span class="state ${n.status==='approved'?'':n.status==='rejected'?'hidden-state':'pending-state'}">${esc(n.status)}</span></div><h3>${esc(n.name)}</h3><p class="guestbook-message">${esc(n.message).replace(/\n/g,'<br>')}</p>${n.tags?.length?`<p>${esc(n.tags.join(' · '))}</p>`:''}</div><div class="entry-actions">${n.status!=='approved'?`<button class="primary" data-guestbook-status="approved" data-guestbook-id="${n.id}">Approve</button>`:''}${n.status!=='rejected'?`<button class="quiet" data-guestbook-status="rejected" data-guestbook-id="${n.id}">Reject</button>`:''}${n.status!=='pending'?`<button class="quiet" data-guestbook-status="pending" data-guestbook-id="${n.id}">Move to pending</button>`:''}<button class="danger" data-guestbook-delete="${n.id}">Delete</button></div></article>`).join(''):'<div class="empty">No guestbook notes match this filter ♡</div>';
    const pending=guestbookNotes.filter(n=>n.status==='pending').length;
    status('guestbookAdminStatus',`${guestbookNotes.length} notes loaded · ${pending} pending approval.`);
  }
  async function updateGuestbookStatus(id,nextStatus) {
    const note=guestbookNotes.find(n=>n.id===id); if(!note)return;
    const label=nextStatus==='approved'?'approve':nextStatus==='rejected'?'reject':'move back to pending';
    if(!confirm(`${label[0].toUpperCase()+label.slice(1)} the note from ${note.name}?`))return;
    status('guestbookAdminStatus','Updating note…');
    const {error}=await client.from('guestbook').update({status:nextStatus}).eq('id',id);
    if(error){status('guestbookAdminStatus',`Could not update note: ${error.message}`,'error');return;}
    await loadGuestbook();
  }
  async function deleteGuestbookNote(id) {
    const note=guestbookNotes.find(n=>n.id===id); if(!note||!confirm(`Permanently delete the note from ${note.name}? This cannot be undone.`))return;
    const {error}=await client.from('guestbook').delete().eq('id',id);
    if(error){status('guestbookAdminStatus',`Could not delete note: ${error.message}`,'error');return;}
    await loadGuestbook();
  }

  function renderEntries() {
    const query=$('listSearch').value.trim().toLowerCase(), section=$('listSection').value;
    const shown=entries.filter(e=>(section==='all'||e.section===section)&&(!query||[e.title,e.description,e.section,(e.tags||[]).join(' '),JSON.stringify(e.metadata||{})].join(' ').toLowerCase().includes(query)));
    $('entryList').innerHTML=shown.length?shown.map(e=>`<article class="entry-item"><div class="entry-item-main"><img class="entry-thumb" src="${esc(e.metadata?.image_path || defaultImage(e.section,e.metadata?.type))}" alt="" loading="lazy" onerror="this.style.display='none'"><div><div class="entry-meta">${sectionNames[e.section]||e.section} · order ${e.sort_order}<span class="state ${e.is_published?'':'hidden-state'}">${e.is_published?'published':'hidden'}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.description||'No description yet.')}</p><p>${esc((e.tags||[]).join(' · '))}</p></div></div><div class="entry-actions"><button class="quiet" data-edit="${e.id}">Edit</button><button class="danger" data-delete="${e.id}">Delete</button></div></article>`).join(''):'<div class="empty">No entries here yet ♡</div>';
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function editEntry(id) { const e=entries.find(x=>x.id===id); if(!e)return; $('entryId').value=e.id; $('section').value=e.section; $('title').value=e.title; $('description').value=e.description||''; $('tags').value=(e.tags||[]).join(', '); syncStructuredFieldsFromMetadata(e.metadata||{},e.section); $('sortOrder').value=e.sort_order||0; $('published').checked=!!e.is_published; $('formHeading').textContent='Edit entry'; $('saveEntry').textContent='Save changes ♡'; $('cancelEdit').hidden=false; $('title').focus(); window.scrollTo({top:0,behavior:'smooth'}); }
  async function saveEntry(event) {
    event.preventDefault();
    const current=entries.find(x=>x.id===$('entryId').value);
    const metadata=buildMetadata(current?.metadata||{});
    const payload={section:$('section').value,title:$('title').value.trim(),description:$('description').value.trim(),tags:$('tags').value.split(',').map(x=>x.trim()).filter(Boolean),metadata,sort_order:Number($('sortOrder').value)||0,is_published:$('published').checked,updated_at:new Date().toISOString()};
    $('saveEntry').disabled=true; status('formStatus','Saving…');
    const id=$('entryId').value;
    const result=id?await client.from('archive_entries').update(payload).eq('id',id):await client.from('archive_entries').insert(payload);
    $('saveEntry').disabled=false;
    if(result.error){status('formStatus',result.error.message,'error');return;}
    status('formStatus','Saved! Your website will show this entry when it refreshes. ♡','success'); resetForm(); await loadEntries();
  }
  async function deleteEntry(id) {
    const e=entries.find(x=>x.id===id); if(!e||!confirm(`Delete “${e.title}” permanently?`))return;
    const {error}=await client.from('archive_entries').delete().eq('id',id);
    if(error){status('listStatus',error.message,'error');return;}
    status('listStatus','Entry deleted.'); await loadEntries(); if($('entryId').value===id)resetForm();
  }
  async function start() {
    if(!configured){status('loginStatus','Add your Supabase project URL and publishable key near the top of js/admin.js.','error');return;}
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await client.auth.getSession(); setLoggedIn(session?.user||null); if(session?.user){await loadEntries();await loadGuestbook();}
    client.auth.onAuthStateChange(async(_event,session)=>{setLoggedIn(session?.user||null); if(session?.user){await loadEntries();await loadGuestbook();}});
  }
  $('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;status('loginStatus','Signing in…');const {error}=await client.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});if(error)status('loginStatus',error.message,'error');else status('loginStatus','Signed in.','success');});
  $('signOut').addEventListener('click',async()=>{await client.auth.signOut();setLoggedIn(null);});
  $('entryForm').addEventListener('submit',saveEntry); $('section').addEventListener('change',updateMetadataHelp); $('entryType').addEventListener('change',()=>{ $('creatorLabel').textContent=$('entryType').value==='Book'?'Author':'Director'; if(Object.values(defaultImages.movies).includes($('entryImage').value)||!$('entryImage').value) $('entryImage').value=defaultImage('movies',$('entryType').value); setImagePreview(); }); $('entryImage').addEventListener('input',setImagePreview); $('resetForm').addEventListener('click',resetForm); $('cancelEdit').addEventListener('click',resetForm); $('refreshEntries').addEventListener('click',loadEntries); $('listSearch').addEventListener('input',renderEntries); $('listSection').addEventListener('change',renderEntries);
  $('entryList').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)editEntry(edit.dataset.edit);if(del)deleteEntry(del.dataset.delete);});
  $('refreshGuestbook').addEventListener('click',loadGuestbook); $('guestbookSearch').addEventListener('input',renderGuestbook); $('guestbookStatusFilter').addEventListener('change',renderGuestbook);
  $('guestbookList').addEventListener('click',e=>{const action=e.target.closest('[data-guestbook-status]'),del=e.target.closest('[data-guestbook-delete]');if(action)updateGuestbookStatus(action.dataset.guestbookId,action.dataset.guestbookStatus);if(del)deleteGuestbookNote(del.dataset.guestbookDelete);});
  updateMetadataHelp(); start();
})();
