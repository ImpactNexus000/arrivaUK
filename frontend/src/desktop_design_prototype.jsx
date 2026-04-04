import { useState } from "react";

/* ── DESIGN TOKENS ── */
const C = {
  navy:       "#0A2342",
  navyMid:    "#1a4a7a",
  navyLight:  "#1e5a96",
  blue:       "#007AFF",
  green:      "#34C759",
  red:        "#FF3B30",
  orange:     "#FF9500",
  indigo:     "#5856D6",
  pink:       "#FF2D55",
  bg:         "#F2F2F7",
  card:       "#FFFFFF",
  border:     "rgba(60,60,67,0.10)",
  label:      "#000000",
  label2:     "#3C3C43",
  label3:     "#6b6b70",
  label4:     "#AEAEB2",
};

const font = `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;

/* ── SHARED ── */
function Badge({ label, color }) {
  const map = {
    green:  ["#E8F9EE","#1A7A3A"],
    red:    ["#FFEAEA","#C0392B"],
    orange: ["#FFF3E0","#B95C00"],
    blue:   ["#E5F0FF","#1558B0"],
    purple: ["#EEE9FF","#4A35B0"],
    gray:   ["#F0F0F5","#6b6b70"],
  };
  const [bg, text] = map[color] || map.gray;
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:bg, color:text, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.label3, marginBottom:10 }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function StatPill({ label, value, color = C.blue }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.13)", backdropFilter:"blur(12px)", borderRadius:12, padding:"10px 16px", border:"1px solid rgba(255,255,255,0.12)" }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginTop:2, letterSpacing:-0.3 }}>{value}</div>
    </div>
  );
}

/* ── SIDEBAR ── */
const NAV = [
  { id:"home",      label:"Home",        icon:<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinejoin="round"/> },
  { id:"checklist", label:"Checklist",   icon:<><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/></> },
  { id:"deals",     label:"Deals",       icon:<path d="M12.5 2l2.79 5.65 6.21.9-4.5 4.38 1.06 6.19L12.5 16.2l-5.56 2.92 1.06-6.19-4.5-4.38 6.21-.9L12.5 2z" strokeLinejoin="round"/> },
  { id:"budget",    label:"Budget",      icon:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round"/></> },
  { id:"docs",      label:"Documents",   icon:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
  { id:"community", label:"Community",   icon:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/></> },
  { id:"local",     label:"Local Guide", icon:<><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 001.3 0C12.95 21.5 20 15.4 20 10a8 8 0 00-8-8z"/></> },
];

function Sidebar({ active, onNav }) {
  return (
    <div style={{
      width:240, flexShrink:0, background:C.navy, display:"flex", flexDirection:"column",
      height:"100%", position:"relative", overflow:"hidden",
    }}>
      {/* Decorative rings */}
      {[300,200].map((s,i)=>(
        <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%",
          border:`${30-i*10}px solid rgba(255,255,255,${0.03+i*0.01})`,
          top:-s*0.4, right:-s*0.4, pointerEvents:"none" }} />
      ))}

      {/* Logo */}
      <div style={{ padding:"32px 24px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            border:"1px solid rgba(255,255,255,0.15)", flexShrink:0 }}>🇬🇧</div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#fff", letterSpacing:-0.4 }}>ArriveUK</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Student Companion</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex:1, padding:"0 12px", display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
          color:"rgba(255,255,255,0.3)", padding:"0 12px 8px" }}>Menu</div>
        {NAV.map(n => {
          const on = active===n.id;
          return (
            <button key={n.id} onClick={()=>onNav(n.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:12,
              border:"none", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s",
              background: on ? "rgba(255,255,255,0.14)" : "transparent",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={on ? "#fff" : "rgba(255,255,255,0.45)"} strokeWidth="1.8">
                {n.icon}
              </svg>
              <span style={{ fontSize:14, fontWeight: on ? 600 : 400,
                color: on ? "#fff" : "rgba(255,255,255,0.5)", letterSpacing:-0.1 }}>
                {n.label}
              </span>
              {on && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:3, background:C.blue }} />}
            </button>
          );
        })}
      </div>

      {/* User profile */}
      <div style={{ padding:"20px 16px 28px" }}>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 14px",
          display:"flex", alignItems:"center", gap:10, border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width:36, height:36, borderRadius:12, background:"#E5F0FF",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"#1558B0", flexShrink:0 }}>CB</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Chigboo</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>UoH · International</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({ onNav }) {
  const quickCards = [
    { id:"checklist", icon:"✅", title:"Arrival Checklist", sub:"2 of 6 tasks completed", tag:"33%", tagColor:"blue", accent:"#E5F0FF" },
    { id:"deals",     icon:"🏷️", title:"Student Deals",    sub:"6 verified offers nearby", tag:"New", tagColor:"green", accent:"#E8F9EE" },
    { id:"budget",    icon:"💷", title:"Budget Tracker",   sub:"£245.20 remaining",        tag:"On track", tagColor:"green", accent:"#E8F9EE" },
    { id:"docs",      icon:"📂", title:"Documents Vault",  sub:"2 files still missing",    tag:"Action", tagColor:"orange", accent:"#FFF3E0" },
    { id:"community", icon:"💬", title:"Community",        sub:"4 new posts today",         tag:"Live", tagColor:"purple", accent:"#EEE9FF" },
    { id:"local",     icon:"📍", title:"Local Guide",      sub:"Near UoH, Hatfield",        tag:"Nearby", tagColor:"blue", accent:"#E0F7FF" },
  ];

  const recentActivity = [
    { icon:"✅", text:"SIM card task marked complete", time:"2h ago", color:"#E8F9EE" },
    { icon:"🏷️", text:"New Spotify student deal added", time:"5h ago", color:"#FFF3E0" },
    { icon:"⚠️", text:"NI Number deadline approaching", time:"1d ago", color:"#FFEAEA" },
    { icon:"💬", text:"Kwame replied to your post", time:"2d ago", color:"#EEE9FF" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Hero */}
      <div style={{
        background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`,
        padding:"40px 40px 48px", position:"relative", overflow:"hidden", flexShrink:0,
      }}>
        {[320,200,120].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%",
            border:`${24-i*6}px solid rgba(255,255,255,${0.04+i*0.01})`,
            top:-s*0.35, right:-s*0.2, pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>
            University of Hertfordshire
          </div>
          <div style={{ fontSize:34, fontWeight:700, color:"#fff", letterSpacing:-0.8, lineHeight:1.15, marginBottom:6 }}>
            Welcome back, Chigboo 👋
          </div>
          <div style={{ fontSize:15, color:"rgba(255,255,255,0.55)", marginBottom:24 }}>
            International student · Day 3 in the UK — you're making great progress.
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["Tasks Done","2 / 6"],["Deals Nearby","6 offers"],["Budget Left","£245.20"],["Days in UK","3"]].map(([l,v])=>(
              <StatPill key={l} label={l} value={v} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 40px", display:"flex", flexDirection:"column", gap:28 }}>
        {/* Alert */}
        <div style={{ background:"#FFF8E6", borderRadius:16, padding:"16px 20px",
          display:"flex", gap:14, alignItems:"flex-start", border:"1px solid rgba(255,196,0,0.3)" }}>
          <span style={{ fontSize:22, flexShrink:0 }}>⚠️</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#7A4800", marginBottom:3 }}>Action required</div>
            <div style={{ fontSize:13, color:"#92400e", lineHeight:1.6 }}>
              Apply for your National Insurance Number within 3 months of arrival. This is required before you can legally work in the UK — don't leave it too late.
            </div>
          </div>
          <button style={{ marginLeft:"auto", flexShrink:0, padding:"8px 18px", borderRadius:10, background:C.orange,
            color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            Apply now →
          </button>
        </div>

        {/* Quick access grid */}
        <div>
          <SectionLabel>Quick Access</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
            {quickCards.map(c=>(
              <button key={c.id} onClick={()=>onNav(c.id)} style={{
                background:C.card, borderRadius:18, padding:"20px", border:`1px solid ${C.border}`,
                textAlign:"left", cursor:"pointer", display:"flex", flexDirection:"column", gap:10,
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.09)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ width:46, height:46, borderRadius:14, background:c.accent,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{c.icon}</div>
                  <Badge label={c.tag} color={c.tagColor} />
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:C.label, letterSpacing:-0.2 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:C.label3, marginTop:3, lineHeight:1.4 }}>{c.sub}</div>
                </div>
                <div style={{ fontSize:12, color:C.blue, fontWeight:600 }}>Open →</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <SectionLabel>Recent Activity</SectionLabel>
            <Card>
              {recentActivity.map((a,i)=>(
                <div key={i}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", padding:"13px 16px" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:a.color,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:C.label, fontWeight:500 }}>{a.text}</div>
                      <div style={{ fontSize:11, color:C.label4, marginTop:2 }}>{a.time}</div>
                    </div>
                  </div>
                  {i<recentActivity.length-1 && <div style={{ height:"0.5px", background:C.border, marginLeft:64 }} />}
                </div>
              ))}
            </Card>
          </div>

          <div>
            <SectionLabel>Your Progress</SectionLabel>
            <Card style={{ padding:"20px" }}>
              {[["SIM Card","Done",100,"#34C759"],["Bank Account","Done",100,"#34C759"],["NI Number","Urgent",0,"#FF3B30"],["GP Registration","Pending",0,"#FF9500"],["Railcard","Pending",0,"#FF9500"]].map(([t,s,p,col])=>(
                <div key={t} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:C.label }}>{t}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:col }}>{s}</span>
                  </div>
                  <div style={{ height:5, background:C.bg, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p}%`, background:col, borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CHECKLIST ── */
function ChecklistScreen() {
  const [items, setItems] = useState([
    { id:1, title:"Get a UK SIM card",      hint:"Giffgaff, Smarty or Lebara — all student-friendly",        badge:"done",   done:true,  group:"Essentials" },
    { id:2, title:"Open a UK bank account", hint:"Monzo or Starling — no UK address needed",                 badge:"done",   done:true,  group:"Essentials" },
    { id:3, title:"Apply for NI Number",    hint:"Required before you can legally work in the UK",            badge:"urgent", done:false, group:"Essentials" },
    { id:4, title:"Register with a GP",     hint:"Free NHS healthcare as an international student",           badge:"soon",   done:false, group:"Admin" },
    { id:5, title:"Get a 16-25 Railcard",   hint:"Saves 1/3 on all UK train fares",                          badge:"soon",   done:false, group:"Admin" },
    { id:6, title:"Register to vote",       hint:"Builds UK credit history too",                              badge:null,     done:false, group:"Admin" },
  ]);
  const toggle = id => setItems(items.map(i=>i.id===id?{...i,done:!i.done}:i));
  const done = items.filter(i=>i.done).length;
  const pct = Math.round(done/items.length*100);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        padding:"36px 40px 40px", flexShrink:0, position:"relative", overflow:"hidden" }}>
        {[250,160].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%",
            border:`20px solid rgba(255,255,255,${0.04+i*0.01})`, top:-s*0.4, right:-s*0.3, pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:-0.6 }}>Arrival Checklist</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginTop:4 }}>{done} of {items.length} tasks completed</div>
          <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ flex:1, height:8, background:"rgba(255,255,255,0.15)", borderRadius:8, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#34C759,#30D158)", borderRadius:8, transition:"width 0.4s ease" }} />
            </div>
            <span style={{ fontSize:14, fontWeight:700, color:"#fff", minWidth:36 }}>{pct}%</span>
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
        {["Essentials","Admin"].map(group=>(
          <div key={group}>
            <SectionLabel>{group}</SectionLabel>
            <Card>
              {items.filter(i=>i.group===group).map((item,idx,arr)=>(
                <div key={item.id}>
                  <div onClick={()=>toggle(item.id)} style={{
                    display:"flex", alignItems:"center", gap:14, padding:"16px 18px", cursor:"pointer",
                    background: item.done ? "rgba(52,199,89,0.05)" : C.card, transition:"background 0.15s",
                    borderRadius: idx===0 ? "16px 16px 0 0" : idx===arr.length-1 ? "0 0 16px 16px" : 0,
                  }}>
                    <div style={{ width:26, height:26, borderRadius:13, flexShrink:0,
                      border: item.done ? "none" : `2px solid ${C.label4}`,
                      background: item.done ? C.green : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                      {item.done && <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, color: item.done ? C.label3 : C.label,
                        textDecoration: item.done ? "line-through" : "none", textDecorationColor:C.label4, letterSpacing:-0.1 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize:12, color:C.label4, marginTop:2, lineHeight:1.5 }}>{item.hint}</div>
                    </div>
                    {item.badge && !item.done && <Badge label={item.badge==="urgent"?"Urgent":"Soon"} color={item.badge==="urgent"?"red":"orange"} />}
                    {item.done && <Badge label="Done" color="green" />}
                  </div>
                  {idx<arr.length-1 && <div style={{ height:"0.5px", background:C.border, marginLeft:58 }} />}
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DEALS ── */
function DealsScreen() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All","Food","Tech","Travel","Health","Shopping"];
  const deals = [
    { name:"UNIDAYS",              cat:"Platform", disc:"Free",       desc:"Hundreds of discounts — Nike, Apple, ASOS with your .ac.uk email.",        accent:C.navy,   discColor:"blue",   icon:"🎓" },
    { name:"Spotify Premium",      cat:"Music",    disc:"50% off",    desc:"£5.99/month with a valid university email. Cancel anytime.",               accent:"#1DB954", discColor:"green",  icon:"🎵" },
    { name:"Amazon Prime Student", cat:"Shopping", disc:"6 mo free",  desc:"Free next-day delivery + Prime Video, then 50% off.",                     accent:"#FF9900", discColor:"orange", icon:"📦" },
    { name:"National Express",     cat:"Travel",   disc:"30% off",    desc:"Student coachcard — 30% off coaches across the whole UK.",                 accent:C.indigo, discColor:"purple", icon:"🚌" },
    { name:"McDonald's",           cat:"Food",     disc:"20% off",    desc:"Show your student ID at any participating UK McDonald's.",                  accent:C.red,    discColor:"red",    icon:"🍔" },
    { name:"Apple Education",      cat:"Tech",     disc:"Up to £200", desc:"Mac, iPad discounts + free AirPods for students.",                         accent:"#555",   discColor:"gray",   icon:"💻" },
    { name:"Headspace",            cat:"Health",   disc:"85% off",    desc:"Mental health & meditation for £9.99/year instead of £69.99.",             accent:"#FF6E5B",discColor:"red",    icon:"🧘" },
    { name:"Student Beans",        cat:"Shopping", disc:"Free",       desc:"Verify your student status once, unlock thousands of deals forever.",      accent:C.blue,   discColor:"blue",   icon:"🫘" },
    { name:"Railcard (16-25)",     cat:"Travel",   disc:"1/3 off",    desc:"Save on every train journey across the UK for a whole year.",              accent:"#009246",discColor:"green",  icon:"🚆" },
  ];
  const filtered = activeFilter==="All" ? deals : deals.filter(d=>d.cat===activeFilter);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Header */}
      <div style={{ padding:"36px 40px 20px", background:C.card, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontSize:28, fontWeight:700, color:C.label, letterSpacing:-0.6 }}>Student Deals</div>
            <div style={{ fontSize:14, color:C.label3, marginTop:4 }}>Verified offers for UK students — updated weekly</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {filters.map(f=>(
              <button key={f} onClick={()=>setActiveFilter(f)} style={{
                padding:"8px 18px", borderRadius:20, border:"none", cursor:"pointer", transition:"all 0.15s",
                background: activeFilter===f ? C.blue : C.bg,
                color: activeFilter===f ? "#fff" : C.label,
                fontSize:13, fontWeight: activeFilter===f ? 600 : 400,
              }}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"24px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          {filtered.map((d,i)=>(
            <div key={i} style={{ background:C.card, borderRadius:18, overflow:"hidden",
              border:`1px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
              display:"flex", flexDirection:"column", transition:"transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.09)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{ height:5, background:d.accent }} />
              <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ fontSize:24 }}>{d.icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:C.label }}>{d.name}</div>
                      <div style={{ fontSize:10, color:C.label4, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.06em" }}>{d.cat}</div>
                    </div>
                  </div>
                  <Badge label={d.disc} color={d.discColor} />
                </div>
                <div style={{ fontSize:12, color:C.label3, lineHeight:1.6, flex:1 }}>{d.desc}</div>
                <div style={{ fontSize:13, color:C.blue, fontWeight:600 }}>Claim offer →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── BUDGET ── */
function BudgetScreen() {
  const categories = [
    { label:"Rent",           icon:"🏠", amount:380,   total:380, color:C.navy },
    { label:"Groceries",      icon:"🛒", amount:87.40, total:200, color:C.green },
    { label:"Transport",      icon:"🚌", amount:54.90, total:100, color:C.orange },
    { label:"Study materials",icon:"📚", amount:38,    total:100, color:C.indigo },
    { label:"Eating out",     icon:"🍔", amount:42,    total:80,  color:C.red },
  ];
  const txns = [
    { name:"Tesco Metro",         date:"Today, 2:14 PM",  amt:-22.40, cat:"🛒" },
    { name:"Oyster card top-up",  date:"Today, 9:05 AM",  amt:-10.00, cat:"🚌" },
    { name:"Amazon textbook",     date:"Yesterday",        amt:-18.00, cat:"📚" },
    { name:"Maintenance loan",    date:"1 Mar",            amt:847.50, cat:"💷" },
    { name:"Nando's",             date:"28 Feb",           amt:-22.00, cat:"🍔" },
    { name:"Aldi groceries",      date:"27 Feb",           amt:-31.40, cat:"🛒" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        padding:"36px 40px 40px", flexShrink:0 }}>
        <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", fontWeight:500, marginBottom:6, letterSpacing:"0.04em" }}>
          March 2026 · Monthly Budget
        </div>
        <div style={{ fontSize:44, fontWeight:700, color:"#fff", letterSpacing:-1.2, marginBottom:16 }}>£847.50</div>
        <div style={{ display:"flex", gap:12 }}>
          {[["Spent","£602.30"],["Remaining","£245.20"],["Days Left","5"],["Transactions","6"]].map(([l,v])=>(
            <StatPill key={l} label={l} value={v} />
          ))}
        </div>
      </div>

      <div style={{ padding:"28px 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
        {/* Spending breakdown */}
        <div>
          <SectionLabel>Spending Breakdown</SectionLabel>
          <Card style={{ padding:"4px 0" }}>
            {categories.map((c,i)=>(
              <div key={c.label}>
                <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:c.color+"18",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:14, fontWeight:500, color:C.label }}>{c.label}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:C.label }}>£{c.amount.toFixed(2)}</span>
                    </div>
                    <div style={{ height:6, background:C.bg, borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(100,c.amount/c.total*100)}%`,
                        background:c.color, borderRadius:4 }} />
                    </div>
                    <div style={{ fontSize:10, color:C.label4, marginTop:3 }}>Budget: £{c.total}</div>
                  </div>
                </div>
                {i<categories.length-1 && <div style={{ height:"0.5px", background:C.border, marginLeft:74 }} />}
              </div>
            ))}
          </Card>
        </div>

        {/* Transactions */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <SectionLabel>Recent Transactions</SectionLabel>
            <button style={{ fontSize:12, color:C.blue, fontWeight:600, border:"none", background:"transparent", cursor:"pointer" }}>+ Add</button>
          </div>
          <Card style={{ marginBottom:14 }}>
            {txns.map((t,i)=>(
              <div key={t.name}>
                <div style={{ padding:"13px 18px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:11, background: t.amt>0?"#E8F9EE":"#F5F5F5",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{t.cat}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:C.label }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.label4, marginTop:1 }}>{t.date}</div>
                  </div>
                  <span style={{ fontSize:15, fontWeight:700, color: t.amt>0?C.green:C.label }}>
                    {t.amt>0?"+":""}£{Math.abs(t.amt).toFixed(2)}
                  </span>
                </div>
                {i<txns.length-1 && <div style={{ height:"0.5px", background:C.border, marginLeft:68 }} />}
              </div>
            ))}
          </Card>
          <button style={{ width:"100%", padding:"14px", borderRadius:14, background:C.blue,
            color:"#fff", border:"none", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            + Add transaction
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── DOCUMENTS ── */
function DocsScreen() {
  const uploaded = [
    { name:"Passport",    meta:"Uploaded 2 days ago · PDF",   icon:"🛂", status:"Verified", sc:"green" },
    { name:"BRP Card",    meta:"Uploaded yesterday · Image",  icon:"📋", status:"Verified", sc:"green" },
    { name:"CAS Letter",  meta:"Uploaded 3 days ago · PDF",   icon:"🎓", status:"Verified", sc:"green" },
  ];
  const needed = [
    { name:"Bank statement",         meta:"Required for tenancy & NI Number",             icon:"🏦", status:"Missing", sc:"red" },
    { name:"NHS registration",       meta:"Needed for healthcare access",                  icon:"🏥", status:"Pending", sc:"orange" },
    { name:"Council tax exemption",  meta:"Students are exempt — get the letter",           icon:"🏛️", status:"Missing", sc:"red" },
  ];

  const DocRow = ({ d, last }) => (
    <>
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
        <div style={{ width:42, height:42, borderRadius:13, background:C.bg,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{d.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500, color:C.label }}>{d.name}</div>
          <div style={{ fontSize:12, color:C.label4, marginTop:2 }}>{d.meta}</div>
        </div>
        <Badge label={d.status} color={d.sc} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.label4} strokeWidth="1.5">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!last && <div style={{ height:"0.5px", background:C.border, marginLeft:74 }} />}
    </>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"36px 40px 20px", background:C.card, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ fontSize:28, fontWeight:700, color:C.label, letterSpacing:-0.6 }}>Documents</div>
        <div style={{ fontSize:14, color:C.label3, marginTop:4 }}>Secure vault for your important files</div>
      </div>

      <div style={{ padding:"28px 40px", display:"flex", flexDirection:"column", gap:24 }}>
        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[["3","Uploaded","All good",C.green],["2","Missing","Action needed",C.red],["1","Pending","In review",C.orange]].map(([n,l,s,c])=>(
            <Card key={l} style={{ padding:"20px 22px" }}>
              <div style={{ fontSize:32, fontWeight:700, color:c, letterSpacing:-0.5 }}>{n}</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.label, marginTop:4 }}>{l}</div>
              <div style={{ fontSize:12, color:C.label3, marginTop:2 }}>{s}</div>
            </Card>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          <div>
            <SectionLabel>Uploaded & Verified</SectionLabel>
            <Card>
              {uploaded.map((d,i)=><DocRow key={d.name} d={d} last={i===uploaded.length-1} />)}
            </Card>
          </div>
          <div>
            <SectionLabel>Still Needed</SectionLabel>
            <Card style={{ marginBottom:14 }}>
              {needed.map((d,i)=><DocRow key={d.name} d={d} last={i===needed.length-1} />)}
            </Card>
            <button style={{ width:"100%", padding:"14px", borderRadius:14,
              background:"transparent", color:C.blue, border:`1.5px dashed ${C.blue}`,
              fontSize:14, fontWeight:600, cursor:"pointer" }}>
              ＋ Upload a document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── COMMUNITY ── */
function CommunityScreen() {
  const posts = [
    { initials:"AO", name:"Amara O.",    uni:"UoH · MSc Biomedical Science",    tag:"Bank",     tagColor:"blue",   av:"#E5F0FF", avText:"#1558B0",
      text:"Monzo opened my account in 10 minutes with just a passport photo. Don't waste time queueing at Barclays — I waited 3 weeks for absolutely nothing.", likes:47, replies:8 },
    { initials:"KN", name:"Kwame N.",    uni:"UCL · MSc Computer Science",       tag:"NI Number",tagColor:"orange", av:"#FFF3E0", avText:"#B95C00",
      text:"NI Number took 3 weeks after I applied online at gov.uk. You get a letter in the post. Don't pay anyone to do this — it is 100% free.", likes:91, replies:14 },
    { initials:"FI", name:"Fatima I.",   uni:"UoH · BSc Pharmacy",               tag:"Food",     tagColor:"red",    av:"#FFF0F3", avText:"#C0392B",
      text:"Aldi and Lidl are your best friends. I spend around £25/week. Check the yellow sticker section in Tesco after 8pm for heavily reduced items!", likes:124, replies:22 },
    { initials:"OB", name:"Olumide B.",  uni:"King's College · MEng",            tag:"Housing",  tagColor:"purple", av:"#EEE9FF", avText:"#4A35B0",
      text:"SpareRoom is better than Rightmove for students. Also check your uni's Facebook housing group — got a room for £650/month in London this way.", likes:76, replies:11 },
    { initials:"AA", name:"Aisha A.",    uni:"UoH · BSc Computer Science",       tag:"Transport",tagColor:"blue",   av:"#E0F7FF", avText:"#0369a1",
      text:"Get the 16-25 Railcard before you do anything else travel-related. Saved me over £80 in my first two months. Payback in under 3 trips.", likes:58, replies:7 },
    { initials:"TB", name:"Tunde B.",    uni:"Manchester · LLB Law",             tag:"NI Number",tagColor:"orange", av:"#FFF3E0", avText:"#B95C00",
      text:"You can work up to 20 hours/week on a student visa. Get your NI Number first, then look at on-campus jobs — easier to manage with your schedule.", likes:103, replies:19 },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"36px 40px 20px", background:C.card, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontSize:28, fontWeight:700, color:C.label, letterSpacing:-0.6 }}>Community</div>
            <div style={{ fontSize:14, color:C.label3, marginTop:4 }}>Real tips from students who've been there</div>
          </div>
          <button style={{ padding:"10px 20px", borderRadius:12, background:C.blue, color:"#fff",
            border:"none", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Share a tip</button>
        </div>
      </div>

      <div style={{ padding:"24px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {posts.map((p,i)=>(
            <Card key={i} style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:p.av, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:p.avText }}>{p.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.label }}>{p.name}</div>
                  <div style={{ fontSize:11, color:C.label4 }}>{p.uni}</div>
                </div>
                <Badge label={p.tag} color={p.tagColor} />
              </div>
              <div style={{ fontSize:13, color:C.label2, lineHeight:1.65, marginBottom:14 }}>{p.text}</div>
              <div style={{ display:"flex", gap:14, paddingTop:12, borderTop:`0.5px solid ${C.border}` }}>
                {[["👍",p.likes],["💬",`${p.replies} replies`]].map(([ic,v])=>(
                  <button key={ic} style={{ display:"flex", alignItems:"center", gap:5, border:"none",
                    background:"transparent", fontSize:12, color:C.label3, cursor:"pointer", padding:0 }}>{ic} {v}</button>
                ))}
                <button style={{ marginLeft:"auto", border:"none", background:"transparent",
                  fontSize:12, fontWeight:600, color:C.blue, cursor:"pointer", padding:0 }}>Save</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── LOCAL GUIDE ── */
function LocalScreen() {
  const [activePin, setActivePin] = useState("All");
  const pins = ["All","🏥 GP","🛒 Food","🍽️ Eat","💊 Pharmacy","🚌 Bus"];
  const places = [
    { icon:"🏥", name:"Hatfield Health Centre",  dist:"0.4 mi", meta:"NHS GP surgery · Open 8am–6pm",          rating:"4.2", cat:"🏥 GP",       bg:"#E5F0FF" },
    { icon:"🛒", name:"Aldi Hatfield",            dist:"0.6 mi", meta:"Cheapest weekly shop in the area",        rating:"4.4", cat:"🛒 Food",      bg:"#E8F9EE" },
    { icon:"🛒", name:"Tesco Extra Hatfield",     dist:"0.8 mi", meta:"Open 24hrs · Student meal deals",         rating:"4.1", cat:"🛒 Food",      bg:"#E8F9EE" },
    { icon:"🍽️", name:"Nando's, The Galleria",   dist:"1.1 mi", meta:"Student discount available",              rating:"4.3", cat:"🍽️ Eat",      bg:"#FFF3E0" },
    { icon:"💊", name:"Boots Pharmacy",           dist:"0.5 mi", meta:"Prescription pickup · Student card",      rating:"4.0", cat:"💊 Pharmacy",  bg:"#EEE9FF" },
    { icon:"🚌", name:"Hatfield Bus Station",     dist:"0.3 mi", meta:"Routes to campus, St Albans & London",    rating:"3.9", cat:"🚌 Bus",       bg:"#FFF0F3" },
    { icon:"🍽️", name:"Café Rouge, Hatfield",    dist:"1.3 mi", meta:"25% off with TOTUM card",                 rating:"4.0", cat:"🍽️ Eat",      bg:"#FFF3E0" },
    { icon:"🛒", name:"Lidl, Hatfield",           dist:"1.0 mi", meta:"Great value fresh produce",               rating:"4.2", cat:"🛒 Food",      bg:"#E8F9EE" },
  ];
  const filtered = activePin==="All" ? places : places.filter(p=>p.cat===activePin);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        padding:"36px 40px 32px", flexShrink:0, position:"relative", overflow:"hidden" }}>
        {[250,160].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%",
            border:`20px solid rgba(255,255,255,${0.04+i*0.01})`, top:-s*0.4, right:-s*0.3, pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:-0.6, marginBottom:4 }}>Local Guide</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)" }}>Near University of Hertfordshire, Hatfield AL10</div>
        </div>
      </div>

      <div style={{ padding:"24px 40px", display:"grid", gridTemplateColumns:"1fr 320px", gap:24, alignItems:"start" }}>
        {/* List */}
        <div>
          {/* Filter chips */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {pins.map(p=>(
              <button key={p} onClick={()=>setActivePin(p)} style={{
                padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer", transition:"all 0.15s",
                background: activePin===p ? C.navy : C.card,
                color: activePin===p ? "#fff" : C.label,
                fontSize:13, fontWeight: activePin===p ? 600 : 400,
                boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
              }}>{p}</button>
            ))}
          </div>
          <Card>
            {filtered.map((pl,i)=>(
              <div key={pl.name}>
                <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
                  <div style={{ width:46, height:46, borderRadius:14, background:pl.bg,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{pl.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.label }}>{pl.name}</div>
                    <div style={{ fontSize:12, color:C.label4, marginTop:2 }}>{pl.meta}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.label }}>{pl.dist}</div>
                    <div style={{ fontSize:11, color:C.orange, marginTop:2 }}>⭐ {pl.rating}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.label4} strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {i<filtered.length-1 && <div style={{ height:"0.5px", background:C.border, marginLeft:78 }} />}
              </div>
            ))}
          </Card>
        </div>

        {/* Map panel */}
        <div style={{ position:"sticky", top:0 }}>
          <SectionLabel>Map</SectionLabel>
          <div style={{ background:"linear-gradient(135deg,#e8f0fe 0%,#dbeafe 50%,#ede9fe 100%)",
            borderRadius:18, border:`1px solid ${C.border}`, height:320,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, position:"relative" }}>
            <div style={{ fontSize:44 }}>🗺️</div>
            <div style={{ fontSize:14, fontWeight:600, color:C.navy }}>Hatfield, Hertfordshire</div>
            <div style={{ fontSize:12, color:C.label3 }}>AL10 · Near campus</div>
            <button style={{ marginTop:8, padding:"9px 20px", borderRadius:10, background:C.blue,
              color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Open in Maps →
            </button>
          </div>
          <Card style={{ marginTop:14, padding:"16px 18px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.label3, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Nearby Summary</div>
            {[["🏥","Hatfield Health Centre","0.4 mi"],["🛒","Aldi Hatfield","0.6 mi"],["💊","Boots Pharmacy","0.5 mi"]].map(([ic,name,dist])=>(
              <div key={name} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:16 }}>{ic}</span>
                <span style={{ fontSize:13, color:C.label, flex:1 }}>{name}</span>
                <span style={{ fontSize:12, color:C.label4 }}>{dist}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── ONBOARDING ── */
function OnboardScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState([null,null,null]);
  const steps = [
    { q:"What's your student status?",   hint:"We'll show you the right visa & NI info",               opts:["🌍  International (non-EU)","🇪🇺  EU / EEA student","🇬🇧  UK home student"] },
    { q:"Which university?",             hint:"We'll tailor deals & local tips to your campus",         opts:["🎓  University of Hertfordshire","🏛️  UCL / King's / Imperial","📚  Other UK university"] },
    { q:"When did you arrive?",          hint:"We'll prioritise your checklist based on this",          opts:["✈️  Haven't arrived yet","📅  Just arrived (this week)","🏠  Been here a while"] },
  ];
  const pick = i => { const n=[...sel]; n[step]=i; setSel(n); };

  return (
    <div style={{ display:"flex", height:"100%", alignItems:"stretch" }}>
      {/* Left panel */}
      <div style={{ width:"42%", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px",
        position:"relative", overflow:"hidden", flexShrink:0 }}>
        {[320,220,130].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%",
            border:`${24-i*6}px solid rgba(255,255,255,${0.05+i*0.01})`,
            bottom:-s*0.3, right:-s*0.3, pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
          <div style={{ width:88, height:88, borderRadius:26, background:"rgba(255,255,255,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, margin:"0 auto 24px",
            backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.15)" }}>🇬🇧</div>
          <div style={{ fontSize:38, fontWeight:700, color:"#fff", letterSpacing:-1, marginBottom:10 }}>ArriveUK</div>
          <div style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:280 }}>
            Your all-in-one guide to settling into student life in the United Kingdom.
          </div>
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:12 }}>
            {["Personalised arrival checklist","Student deals & savings","Budget tracker","Document vault","Local guide"].map(f=>(
              <div key={f} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:20, height:20, borderRadius:10, background:"rgba(52,199,89,0.25)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#34C759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px" }}>
        <div style={{ width:"100%", maxWidth:460 }}>
          <div style={{ display:"flex", gap:6, marginBottom:28 }}>
            {steps.map((_,i)=>(
              <div key={i} style={{ height:4, borderRadius:4, flex: i===step?2:1,
                background: i===step ? C.blue : i<step ? C.green : C.border,
                transition:"all 0.3s ease" }} />
            ))}
          </div>
          <div style={{ fontSize:24, fontWeight:700, color:C.label, letterSpacing:-0.5, marginBottom:6 }}>
            {steps[step].q}
          </div>
          <div style={{ fontSize:14, color:C.label3, marginBottom:24 }}>{steps[step].hint}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            {steps[step].opts.map((o,i)=>(
              <button key={i} onClick={()=>pick(i)} style={{
                padding:"16px 18px", borderRadius:14,
                border: sel[step]===i ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`,
                background: sel[step]===i ? "#E5F0FF" : C.card,
                color: sel[step]===i ? C.blue : C.label,
                fontSize:15, fontWeight: sel[step]===i ? 600 : 400,
                textAlign:"left", cursor:"pointer", transition:"all 0.15s",
              }}>{o}</button>
            ))}
          </div>
          <button onClick={()=>step<2?setStep(step+1):onDone()} style={{
            width:"100%", padding:"16px", borderRadius:14,
            background: sel[step]!==null ? C.blue : C.label4,
            color:"#fff", fontSize:16, fontWeight:600, border:"none",
            cursor: sel[step]!==null ? "pointer" : "default", transition:"background 0.2s",
          }}>
            {step<2 ? "Continue →" : "Let's go 🚀"}
          </button>
          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:C.label4 }}>
            Step {step+1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ROOT ── */
export default function ArriveUKDesktop() {
  const [screen, setScreen] = useState("onboard");

  const renderScreen = () => {
    switch(screen) {
      case "onboard":    return <OnboardScreen onDone={()=>setScreen("home")} />;
      case "home":       return <HomeScreen onNav={setScreen} />;
      case "checklist":  return <ChecklistScreen />;
      case "deals":      return <DealsScreen />;
      case "budget":     return <BudgetScreen />;
      case "docs":       return <DocsScreen />;
      case "community":  return <CommunityScreen />;
      case "local":      return <LocalScreen />;
      default:           return <HomeScreen onNav={setScreen} />;
    }
  };

  const showSidebar = screen !== "onboard";

  return (
    <div style={{ width:"100%", height:"100vh", background:"#0f0f1a", display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:font }}>

      {/* Browser chrome */}
      <div style={{ width:"min(1280px,96vw)", height:"min(820px,90vh)", borderRadius:14,
        overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        display:"flex", flexDirection:"column" }}>

        {/* Title bar */}
        <div style={{ height:40, background:"#1e1e1e", display:"flex", alignItems:"center",
          padding:"0 16px", gap:8, flexShrink:0 }}>
          {["#FF5F56","#FFBD2E","#27C93F"].map((c,i)=>(
            <div key={i} style={{ width:12, height:12, borderRadius:6, background:c }} />
          ))}
          <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
            <div style={{ background:"#2a2a2a", borderRadius:6, padding:"4px 20px",
              fontSize:12, color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:6 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              arriveuk.co.uk
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:28, height:20, borderRadius:4, background:"rgba(255,255,255,0.06)" }} />
            ))}
          </div>
        </div>

        {/* App */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", background:C.bg }}>
          {showSidebar && <Sidebar active={screen} onNav={setScreen} />}
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {renderScreen()}
          </div>
        </div>
      </div>
    </div>
  );
}
