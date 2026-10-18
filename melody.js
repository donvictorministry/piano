/* melody.js — DV-Piano song library: hymns, carols & gospel songs only */
const songLibrary = {

  'Amazing Grace': { title:'Amazing Grace', notes:[
    {note:'C4',time:0,duration:.6},{note:'F4',time:.8,duration:1.0},
    {note:'A4',time:1.9,duration:.4},{note:'F4',time:2.4,duration:.4},
    {note:'A4',time:2.9,duration:1.0},{note:'G4',time:4.0,duration:.6},
    {note:'F4',time:4.7,duration:1.0},{note:'D4',time:5.8,duration:.6},
    {note:'C4',time:6.5,duration:1.2},{note:'C4',time:7.9,duration:.6},
    {note:'F4',time:8.6,duration:1.0},{note:'A4',time:9.7,duration:.4},
    {note:'F4',time:10.2,duration:.4},{note:'A4',time:10.7,duration:1.0},
    {note:'C5',time:11.8,duration:1.6},{note:'A4',time:13.5,duration:.6},
    {note:'C5',time:14.2,duration:1.0},{note:'A4',time:15.3,duration:.4},
    {note:'F4',time:15.8,duration:.4},{note:'A4',time:16.3,duration:1.0},
    {note:'G4',time:17.4,duration:.6},{note:'F4',time:18.1,duration:1.0},
    {note:'D4',time:19.2,duration:.6},{note:'C4',time:19.9,duration:1.8}
  ]},

  'Silent Night': { title:'Silent Night', notes:[
    {note:'G4',time:0,duration:.8},{note:'A4',time:.9,duration:.4},
    {note:'G4',time:1.4,duration:.7},{note:'E4',time:2.2,duration:1.6},
    {note:'G4',time:4.0,duration:.8},{note:'A4',time:4.9,duration:.4},
    {note:'G4',time:5.4,duration:.7},{note:'E4',time:6.2,duration:1.6},
    {note:'D5',time:8.0,duration:.9},{note:'D5',time:9.0,duration:.6},
    {note:'B4',time:9.7,duration:1.6},{note:'C5',time:11.5,duration:.9},
    {note:'C5',time:12.4,duration:.6},{note:'G4',time:13.1,duration:1.6},
    {note:'A4',time:14.9,duration:.9},{note:'A4',time:15.9,duration:.6},
    {note:'C5',time:16.6,duration:.4},{note:'B4',time:17.1,duration:.6},
    {note:'A4',time:17.8,duration:.9},{note:'G4',time:18.8,duration:.7},
    {note:'A4',time:19.6,duration:.4},{note:'G4',time:20.1,duration:.7},
    {note:'E4',time:20.9,duration:2.0}
  ]},

  'O Holy Night': { title:'O Holy Night', notes:[
    {note:'A4',time:0,duration:.6},{note:'A4',time:.7,duration:.3},
    {note:'C5',time:1.1,duration:.9},{note:'A4',time:2.1,duration:.5},
    {note:'F4',time:2.7,duration:.5},{note:'F4',time:3.3,duration:.9},
    {note:'G4',time:4.3,duration:.5},{note:'E4',time:4.9,duration:.5},
    {note:'G4',time:5.5,duration:.5},{note:'C5',time:6.1,duration:1.2},
    {note:'B4',time:7.4,duration:1.5},{note:'B4',time:9.0,duration:.3},
    {note:'C5',time:9.4,duration:.6},{note:'D5',time:10.1,duration:.5},
    {note:'C5',time:10.7,duration:.4},{note:'B4',time:11.2,duration:.4},
    {note:'A4',time:11.7,duration:1.8}
  ]},

  'Joy to the World': { title:'Joy to the World', notes:[
    {note:'C5',time:0,duration:.5},{note:'B4',time:.5,duration:.5},
    {note:'A4',time:1.0,duration:.5},{note:'G4',time:1.5,duration:.5},
    {note:'F4',time:2.0,duration:.5},{note:'E4',time:2.5,duration:.5},
    {note:'D4',time:3.0,duration:.5},{note:'C4',time:3.5,duration:1.0},
    {note:'C5',time:4.7,duration:.5},{note:'C5',time:5.2,duration:.5},
    {note:'C5',time:5.7,duration:.5},{note:'B4',time:6.2,duration:.5},
    {note:'A4',time:6.7,duration:1.0},{note:'G4',time:7.9,duration:.5},
    {note:'G4',time:8.4,duration:.5},{note:'G4',time:8.9,duration:.5},
    {note:'F4',time:9.4,duration:.5},{note:'E4',time:9.9,duration:1.0},
    {note:'D4',time:11.1,duration:.5},{note:'D4',time:11.6,duration:.5},
    {note:'E4',time:12.1,duration:.5},{note:'F4',time:12.6,duration:.5},
    {note:'E4',time:13.1,duration:.5},{note:'D4',time:13.6,duration:.5},
    {note:'C4',time:14.1,duration:1.6}
  ]},

  'Hark the Herald Angels Sing': { title:'Hark the Herald Angels Sing', notes:[
    {note:'G4',time:0,duration:.5},{note:'G4',time:.5,duration:.3},
    {note:'A4',time:.8,duration:.8},{note:'G4',time:1.6,duration:.5},
    {note:'F4',time:2.1,duration:.8},{note:'E4',time:2.9,duration:.5},
    {note:'E4',time:3.4,duration:.3},{note:'F4',time:3.7,duration:.8},
    {note:'E4',time:4.5,duration:.5},{note:'D4',time:5.0,duration:1.5},
    {note:'G4',time:6.5,duration:.5},{note:'G4',time:7.0,duration:.3},
    {note:'A4',time:7.3,duration:.8},{note:'G4',time:8.1,duration:.5},
    {note:'F4',time:8.6,duration:.8},{note:'E4',time:9.4,duration:.5},
    {note:'E4',time:9.9,duration:.3},{note:'F4',time:10.2,duration:.8},
    {note:'E4',time:11.0,duration:.5},{note:'D4',time:11.5,duration:1.5},
    {note:'D5',time:13.0,duration:.5},{note:'D5',time:13.5,duration:.5},
    {note:'D5',time:14.0,duration:.5},{note:'C5',time:14.5,duration:.5},
    {note:'B4',time:15.0,duration:1.0},{note:'C5',time:16.1,duration:.5},
    {note:'B4',time:16.6,duration:.5},{note:'A4',time:17.1,duration:1.8}
  ]},

  'O Come All Ye Faithful': { title:'O Come All Ye Faithful', notes:[
    {note:'G4',time:0,duration:.7},{note:'D5',time:.8,duration:.7},
    {note:'D5',time:1.6,duration:.4},{note:'E5',time:2.0,duration:.4},
    {note:'D5',time:2.5,duration:.4},{note:'C5',time:3.0,duration:.7},
    {note:'B4',time:3.8,duration:.7},{note:'E5',time:4.6,duration:.7},
    {note:'E5',time:5.4,duration:.4},{note:'F5',time:5.8,duration:.4},
    {note:'E5',time:6.3,duration:.4},{note:'D5',time:6.8,duration:.7},
    {note:'C5',time:7.6,duration:.7},{note:'A4',time:8.4,duration:.7},
    {note:'D5',time:9.2,duration:.7},{note:'B4',time:10.0,duration:.7},
    {note:'C5',time:10.8,duration:1.6},
    {note:'G4',time:12.6,duration:.4},{note:'A4',time:13.0,duration:.4},
    {note:'G4',time:13.4,duration:.4},{note:'C5',time:13.8,duration:.4},
    {note:'B4',time:14.2,duration:.4},{note:'A4',time:14.6,duration:.4},
    {note:'G4',time:15.0,duration:1.6}
  ]},

  'Away in a Manger': { title:'Away in a Manger', notes:[
    {note:'F4',time:0,duration:.7},{note:'C5',time:.8,duration:.4},
    {note:'C5',time:1.2,duration:.4},{note:'D5',time:1.6,duration:.7},
    {note:'C5',time:2.4,duration:.4},{note:'B4',time:2.8,duration:.7},
    {note:'A4',time:3.6,duration:1.4},
    {note:'F4',time:5.2,duration:.7},{note:'A4',time:6.0,duration:.4},
    {note:'A4',time:6.4,duration:.4},{note:'B4',time:6.8,duration:.7},
    {note:'C5',time:7.6,duration:.4},{note:'A4',time:8.0,duration:.7},
    {note:'G4',time:8.8,duration:1.4},
    {note:'C5',time:10.4,duration:.7},{note:'D5',time:11.2,duration:.4},
    {note:'C5',time:11.6,duration:.4},{note:'B4',time:12.0,duration:.7},
    {note:'C5',time:12.8,duration:.4},{note:'A4',time:13.2,duration:.7},
    {note:'F4',time:14.0,duration:1.8}
  ]},

  'What Child Is This': { title:'What Child Is This', notes:[
    {note:'D5',time:0,duration:.7},{note:'A4',time:.8,duration:.7},
    {note:'B4',time:1.6,duration:.4},{note:'C5',time:2.0,duration:.4},
    {note:'D5',time:2.5,duration:1.0},{note:'A4',time:3.6,duration:.7},
    {note:'F4',time:4.4,duration:.7},{note:'D4',time:5.2,duration:1.0},
    {note:'E4',time:6.3,duration:.7},{note:'F4',time:7.1,duration:.4},
    {note:'E4',time:7.6,duration:.4},{note:'D4',time:8.1,duration:1.4},
    {note:'D5',time:9.6,duration:.7},{note:'A4',time:10.4,duration:.7},
    {note:'B4',time:11.2,duration:.4},{note:'C5',time:11.6,duration:.4},
    {note:'D5',time:12.1,duration:1.0},{note:'A4',time:13.2,duration:.7},
    {note:'F4',time:14.0,duration:.7},{note:'D4',time:14.8,duration:1.8}
  ]},

  'Go Tell It on the Mountain': { title:'Go Tell It on the Mountain', notes:[
    {note:'C4',time:0,duration:.5},{note:'E4',time:.5,duration:.5},
    {note:'G4',time:1.0,duration:1.0},{note:'A4',time:2.1,duration:.5},
    {note:'G4',time:2.6,duration:.5},{note:'E4',time:3.1,duration:1.0},
    {note:'C4',time:4.2,duration:.5},{note:'E4',time:4.7,duration:.5},
    {note:'G4',time:5.2,duration:1.0},{note:'E4',time:6.3,duration:.5},
    {note:'C4',time:6.8,duration:1.4},
    {note:'F4',time:8.4,duration:.5},{note:'F4',time:8.9,duration:.5},
    {note:'G4',time:9.4,duration:.5},{note:'F4',time:9.9,duration:.5},
    {note:'E4',time:10.4,duration:1.0},{note:'D4',time:11.5,duration:.5},
    {note:'E4',time:12.0,duration:.5},{note:'C4',time:12.5,duration:1.8}
  ]},

  'How Great Thou Art': { title:'How Great Thou Art', notes:[
    {note:'C4',time:0,duration:.9},{note:'E4',time:1.0,duration:.4},
    {note:'F4',time:1.5,duration:.9},{note:'E4',time:2.5,duration:.4},
    {note:'D4',time:3.0,duration:.9},{note:'C4',time:4.0,duration:1.4},
    {note:'C4',time:5.6,duration:.9},{note:'F4',time:6.6,duration:.4},
    {note:'A4',time:7.1,duration:.9},{note:'G4',time:8.1,duration:.4},
    {note:'F4',time:8.6,duration:.9},{note:'E4',time:9.6,duration:1.4},
    {note:'F4',time:11.2,duration:.9},{note:'A4',time:12.2,duration:.4},
    {note:'C5',time:12.7,duration:.9},{note:'A4',time:13.7,duration:.4},
    {note:'F4',time:14.2,duration:.9},{note:'D4',time:15.2,duration:1.4},
    {note:'E4',time:16.8,duration:.9},{note:'D4',time:17.8,duration:.4},
    {note:'C4',time:18.3,duration:2.0}
  ]},

  'Blessed Assurance': { title:'Blessed Assurance', notes:[
    {note:'F4',time:0,duration:.5},{note:'F4',time:.5,duration:.3},
    {note:'F4',time:.8,duration:.7},{note:'A4',time:1.6,duration:.5},
    {note:'C5',time:2.1,duration:1.0},{note:'C5',time:3.2,duration:.5},
    {note:'A4',time:3.7,duration:.5},{note:'F4',time:4.2,duration:1.0},
    {note:'C5',time:5.3,duration:.5},{note:'C5',time:5.8,duration:.3},
    {note:'C5',time:6.1,duration:.7},{note:'D5',time:6.9,duration:.5},
    {note:'C5',time:7.4,duration:1.0},{note:'A4',time:8.5,duration:.5},
    {note:'F4',time:9.0,duration:.5},{note:'G4',time:9.5,duration:1.4},
    {note:'C5',time:11.0,duration:.7},{note:'C5',time:11.8,duration:.7},
    {note:'D5',time:12.6,duration:.7},{note:'C5',time:13.4,duration:.7},
    {note:'A4',time:14.2,duration:1.4}
  ]},

  'Great Is Thy Faithfulness': { title:'Great Is Thy Faithfulness', notes:[
    {note:'C4',time:0,duration:.6},{note:'F4',time:.7,duration:.6},
    {note:'F4',time:1.4,duration:.4},{note:'G4',time:1.9,duration:.4},
    {note:'A4',time:2.4,duration:1.0},{note:'F4',time:3.5,duration:.6},
    {note:'A4',time:4.2,duration:.6},{note:'G4',time:4.9,duration:1.0},
    {note:'C4',time:6.1,duration:.6},{note:'F4',time:6.8,duration:.6},
    {note:'F4',time:7.5,duration:.4},{note:'E4',time:8.0,duration:.4},
    {note:'D4',time:8.5,duration:1.4},
    {note:'A4',time:10.1,duration:.6},{note:'A4',time:10.8,duration:.4},
    {note:'C5',time:11.3,duration:.6},{note:'C5',time:12.0,duration:.4},
    {note:'A4',time:12.5,duration:1.0},{note:'G4',time:13.7,duration:.6},
    {note:'F4',time:14.4,duration:2.0}
  ]},

  'It Is Well With My Soul': { title:'It Is Well With My Soul', notes:[
    {note:'C4',time:0,duration:1.0},{note:'G4',time:1.1,duration:.5},
    {note:'C5',time:1.7,duration:.7},{note:'C5',time:2.5,duration:.5},
    {note:'B4',time:3.1,duration:1.0},{note:'A4',time:4.2,duration:1.0},
    {note:'G4',time:5.4,duration:1.4},
    {note:'C4',time:7.0,duration:1.0},{note:'G4',time:8.1,duration:.5},
    {note:'C5',time:8.7,duration:.7},{note:'C5',time:9.5,duration:.5},
    {note:'D5',time:10.1,duration:1.0},{note:'C5',time:11.2,duration:1.0},
    {note:'B4',time:12.4,duration:1.4}
  ]},

  'Deck the Halls': { title:'Deck the Halls', notes:[
    {note:'C5',time:0,duration:.6},{note:'B4',time:.7,duration:.3},
    {note:'A4',time:1.1,duration:.5},{note:'G4',time:1.7,duration:.5},
    {note:'F4',time:2.3,duration:.5},{note:'G4',time:2.9,duration:.3},
    {note:'A4',time:3.3,duration:.3},{note:'F4',time:3.7,duration:.5},
    {note:'G4',time:4.3,duration:.3},{note:'A4',time:4.7,duration:.3},
    {note:'A#4',time:5.1,duration:.3},{note:'A4',time:5.5,duration:.3},
    {note:'G4',time:5.9,duration:.5},{note:'F4',time:6.5,duration:.3},
    {note:'G4',time:6.9,duration:.3},{note:'A4',time:7.3,duration:.5},
    {note:'G4',time:7.9,duration:1.0}
  ]},

  'We Wish You a Merry Christmas': { title:'We Wish You a Merry Christmas', notes:[
    {note:'G4',time:0,duration:.3},
    {note:'C5',time:.4,duration:.5},{note:'C5',time:1.0,duration:.25},
    {note:'D5',time:1.3,duration:.25},{note:'C5',time:1.6,duration:.25},{note:'B4',time:1.9,duration:.25},
    {note:'A4',time:2.2,duration:.5},{note:'A4',time:2.8,duration:.3},{note:'A4',time:3.2,duration:.3},
    {note:'D5',time:3.6,duration:.5},{note:'D5',time:4.2,duration:.25},
    {note:'E5',time:4.5,duration:.25},{note:'D5',time:4.8,duration:.25},{note:'C5',time:5.1,duration:.25},
    {note:'B4',time:5.4,duration:.5},{note:'G4',time:6.0,duration:.3},{note:'G4',time:6.4,duration:.3},
    {note:'E5',time:6.8,duration:.5},{note:'E5',time:7.4,duration:.25},
    {note:'F5',time:7.7,duration:.25},{note:'E5',time:8.0,duration:.25},{note:'D5',time:8.3,duration:.25},
    {note:'C5',time:8.6,duration:.5},{note:'A4',time:9.2,duration:.3},{note:'G4',time:9.6,duration:.3},
    {note:'A4',time:10.0,duration:.5},{note:'D5',time:10.6,duration:.6},
    {note:'B4',time:11.3,duration:.3},{note:'C5',time:11.7,duration:1.6}
  ]},

  'Jingle Bells': { title:'Jingle Bells', notes:[
    {note:'E4',time:0,duration:.3},{note:'E4',time:.4,duration:.3},{note:'E4',time:.8,duration:.6},
    {note:'E4',time:1.6,duration:.3},{note:'E4',time:2.0,duration:.3},{note:'E4',time:2.4,duration:.6},
    {note:'E4',time:3.2,duration:.3},{note:'G4',time:3.6,duration:.3},
    {note:'C4',time:4.0,duration:.4},{note:'D4',time:4.5,duration:.3},{note:'E4',time:5.0,duration:1.0},
    {note:'F4',time:6.2,duration:.3},{note:'F4',time:6.6,duration:.3},
    {note:'F4',time:7.0,duration:.4},{note:'F4',time:7.5,duration:.3},
    {note:'F4',time:7.9,duration:.3},{note:'E4',time:8.3,duration:.3},
    {note:'E4',time:8.7,duration:.3},{note:'E4',time:9.1,duration:.2},{note:'E4',time:9.4,duration:.2},
    {note:'E4',time:9.7,duration:.3},{note:'D4',time:10.1,duration:.3},
    {note:'D4',time:10.5,duration:.3},{note:'E4',time:10.9,duration:.3},
    {note:'D4',time:11.3,duration:.6},{note:'G4',time:12.0,duration:1.4}
  ]},

  'It Came Upon the Midnight Clear': { title:'It Came Upon the Midnight Clear', notes:[
    {note:'D5',time:0,duration:1.0},{note:'A4',time:1.1,duration:.5},
    {note:'B4',time:1.7,duration:.5},{note:'C5',time:2.3,duration:1.0},
    {note:'D5',time:3.4,duration:.5},{note:'E5',time:4.0,duration:.5},
    {note:'D5',time:4.6,duration:1.4},
    {note:'F5',time:6.2,duration:1.0},{note:'E5',time:7.3,duration:.5},
    {note:'D5',time:7.9,duration:.5},{note:'C5',time:8.5,duration:1.0},
    {note:'B4',time:9.6,duration:.5},{note:'A4',time:10.2,duration:.5},
    {note:'G4',time:10.8,duration:1.4},
    {note:'A4',time:12.4,duration:1.0},{note:'B4',time:13.5,duration:.5},
    {note:'C5',time:14.1,duration:.5},{note:'D5',time:14.7,duration:1.0},
    {note:'E5',time:15.9,duration:.5},{note:'D5',time:16.5,duration:1.8}
  ]},

  'Crown Him With Many Crowns': { title:'Crown Him With Many Crowns', notes:[
    {note:'D5',time:0,duration:.6},{note:'D5',time:.7,duration:.4},
    {note:'C5',time:1.2,duration:.4},{note:'B4',time:1.7,duration:.6},
    {note:'A4',time:2.4,duration:1.0},{note:'B4',time:3.5,duration:.4},
    {note:'C5',time:4.0,duration:.4},{note:'D5',time:4.5,duration:1.0},
    {note:'E5',time:5.6,duration:.6},{note:'D5',time:6.3,duration:.4},
    {note:'C5',time:6.8,duration:.6},{note:'B4',time:7.5,duration:1.4},
    {note:'D5',time:9.1,duration:.6},{note:'D5',time:9.8,duration:.4},
    {note:'C5',time:10.3,duration:.4},{note:'B4',time:10.8,duration:.6},
    {note:'A4',time:11.5,duration:2.0}
  ]},

  'All Hail the Power of Jesus Name': { title:'All Hail the Power of Jesus Name', notes:[
    {note:'G4',time:0,duration:.6},{note:'C5',time:.7,duration:.6},
    {note:'C5',time:1.4,duration:.4},{note:'B4',time:1.9,duration:.4},
    {note:'C5',time:2.4,duration:1.0},{note:'D5',time:3.5,duration:.6},
    {note:'E5',time:4.2,duration:.6},{note:'D5',time:4.9,duration:1.0},
    {note:'C5',time:6.0,duration:.6},{note:'B4',time:6.7,duration:.4},
    {note:'A4',time:7.2,duration:.4},{note:'G4',time:7.7,duration:1.4},
    {note:'C5',time:9.3,duration:.6},{note:'D5',time:10.0,duration:.4},
    {note:'E5',time:10.5,duration:.6},{note:'D5',time:11.2,duration:1.0},
    {note:'C5',time:12.3,duration:2.0}
  ]}

};