(() => {
    const SUPABASE_URL = 'https://fdqctimtqehetboszlbg.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_gHfal4nlxw_5j67FTmV_0w_hIzRMjLu';
  const configured = /^https:\/\//.test(SUPABASE_URL) && !SUPABASE_URL.includes('YOUR_') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_');
  const $ = (id) => document.getElementById(id);
  const sectionNames = {movies:'Movies & series',ships:'Ships & dynamics',songs:'Songs',hobbies:'Hobbies & interests'};
  let client = null, entries = [];
  const exampleMetadata = {
    movies:{type:'Movie',year:2024,genres:['Fantasy'],emoji:'🎬',color:'poster-lilac'},
    ships:{kind:'Ship',fandom:'',characters:'',tropes:['Slow burn'],emoji:'💌'},
    songs:{artist:'',src:'assets/music/example.mp3',mood:'comfort song',url:''},
    hobbies:{kind:'Hobby',category:'Creative',emoji:'✿'}
  };
  const helpText = {
    movies:'Movie/series: {"type":"Movie","year":2024,"genres":["Fantasy","Drama"],"emoji":"🎬"}\nBook: {"type":"Book","author":"Author name","year":2024,"genres":["Fantasy"],"image_path":"assets/images/archive/books/1.png","emoji":"📚"}',
    ships:'Example: {"kind":"Ship","fandom":"Fandom name","characters":"A × B","tropes":["Slow burn","Mutual pining"],"emoji":"💌"}',
    songs:'Example: {"artist":"Artist name","src":"assets/music/song.mp3","mood":"late night","url":"https://open.spotify.com/track/..."}',
    hobbies:'Example: {"kind":"Hobby","category":"Creative","emoji":"🎨"}'
  };
  function status(id, message, kind='') { const el=$(id); el.textContent=message; el.className=`status ${kind}`.trim(); }
  function setLoggedIn(user) { $('loginCard').hidden=!!user; $('dashboard').hidden=!user; }
  function resetForm() { $('entryForm').reset(); $('entryId').value=''; $('sortOrder').value='0'; $('published').checked=true; $('metadata').value=JSON.stringify(exampleMetadata[$('section').value],null,2); $('formHeading').textContent='Add an entry'; $('saveEntry').textContent='Save entry ♡'; $('cancelEdit').hidden=true; status('formStatus',''); }
  function updateMetadataHelp() { $('metadataHelp').textContent=helpText[$('section').value]; if(!$('entryId').value) $('metadata').value=JSON.stringify(exampleMetadata[$('section').value],null,2); }
  async function loadEntries() {
    status('listStatus','Loading entries…');
    const {data,error}=await client.from('archive_entries').select('*').order('section').order('sort_order').order('created_at',{ascending:false});
    if(error) { status('listStatus',error.message,'error'); return; }
    entries=data||[]; renderEntries(); status('listStatus',`${entries.length} ${entries.length===1?'entry':'entries'} loaded.`);
  }
  function renderEntries() {
    const query=$('listSearch').value.trim().toLowerCase(), section=$('listSection').value;
    const shown=entries.filter(e=>(section==='all'||e.section===section)&&(!query||[e.title,e.description,e.section,(e.tags||[]).join(' '),JSON.stringify(e.metadata||{})].join(' ').toLowerCase().includes(query)));
    $('entryList').innerHTML=shown.length?shown.map(e=>`<article class="entry-item"><div><div class="entry-meta">${sectionNames[e.section]||e.section} · order ${e.sort_order}<span class="state ${e.is_published?'':'hidden-state'}">${e.is_published?'published':'hidden'}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.description||'No description yet.')}</p><p>${esc((e.tags||[]).join(' · '))}</p></div><div class="entry-actions"><button class="quiet" data-edit="${e.id}">Edit</button><button class="danger" data-delete="${e.id}">Delete</button></div></article>`).join(''):'<div class="empty">No entries here yet ♡</div>';
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function editEntry(id) { const e=entries.find(x=>x.id===id); if(!e)return; $('entryId').value=e.id; $('section').value=e.section; $('title').value=e.title; $('description').value=e.description||''; $('tags').value=(e.tags||[]).join(', '); $('metadata').value=JSON.stringify(e.metadata||{},null,2); $('sortOrder').value=e.sort_order||0; $('published').checked=!!e.is_published; $('formHeading').textContent='Edit entry'; $('saveEntry').textContent='Save changes ♡'; $('cancelEdit').hidden=false; updateMetadataHelp(); $('title').focus(); window.scrollTo({top:0,behavior:'smooth'}); }
  async function saveEntry(event) {
    event.preventDefault();
    let metadata;
    try { metadata=JSON.parse($('metadata').value||'{}'); if(!metadata||Array.isArray(metadata)||typeof metadata!=='object') throw new Error('Details must be a JSON object.'); }
    catch(e){status('formStatus',`Check the Extra details JSON: ${e.message}`,'error');return;}
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
    const {data:{session}}=await client.auth.getSession(); setLoggedIn(session?.user||null); if(session?.user)await loadEntries();
    client.auth.onAuthStateChange(async(_event,session)=>{setLoggedIn(session?.user||null); if(session?.user) await loadEntries();});
  }
  $('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;status('loginStatus','Signing in…');const {error}=await client.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});if(error)status('loginStatus',error.message,'error');else status('loginStatus','Signed in.','success');});
  $('signOut').addEventListener('click',async()=>{await client.auth.signOut();setLoggedIn(null);});
  $('entryForm').addEventListener('submit',saveEntry); $('section').addEventListener('change',updateMetadataHelp); $('resetForm').addEventListener('click',resetForm); $('cancelEdit').addEventListener('click',resetForm); $('refreshEntries').addEventListener('click',loadEntries); $('listSearch').addEventListener('input',renderEntries); $('listSection').addEventListener('change',renderEntries);
  $('entryList').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)editEntry(edit.dataset.edit);if(del)deleteEntry(del.dataset.delete);});
  updateMetadataHelp(); start();
})();
