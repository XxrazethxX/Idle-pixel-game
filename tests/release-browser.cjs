// Optional browser check: requires Playwright and Chromium; run against the built site.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
    const start=1700000000000;
    await page.addInitScript(now=>{window.releaseClock=now;Date.now=()=>window.releaseClock;},start);
    await page.goto(process.env.GAME_URL||'http://127.0.0.1:8008');
    const tabs={plant:'village-tab',restore:'village-tab',pond:'village-tab',library:'village-tab',lantern:'village-tab',orchard:'expand-tab',workshop:'expand-tab',teahouse:'expand-tab',square:'square-tab',mosslight:'square-tab'};
    let minutes=0;
    async function buy(id){
      const tab=id.startsWith('upgrade-')?'upgrade-tab':tabs[id];
      await page.locator('#'+tab).click();
      let attempts=0;
      while(await page.locator('#'+id).isDisabled()){
        assert.ok(attempts++<240,`Progression stalled: ${id}`);
        await page.locator('#village-tab').click();
        for(let i=0;i<3;i++)await page.locator('#gather').click();
        // Simulate a minute away. The normal visibility handler accrues income; no supplies are injected.
        await page.evaluate(()=>{window.releaseClock+=60000;document.dispatchEvent(new Event('visibilitychange'));});minutes++;
        await page.locator('#'+tab).click();
      }
      await page.locator('#'+id).click();
    }
    await buy('plant');await buy('restore');
    for(const id of ['pond','library','orchard','workshop','teahouse'])await buy(id);
    for(let i=1;i<5;i++)await buy('plant');for(let i=0;i<4;i++)await buy('lantern');
    for(const id of ['bakery','pond','library','orchard','workshop','teahouse'])await buy('upgrade-'+id);
    for(let i=0;i<3;i++)await buy('square');await buy('mosslight');
    assert.equal(minutes,175);assert.equal(await page.locator('#ending').evaluate(e=>e.open),true);
    await page.locator('#keep-playing').click();
    // Keep the simulated time through reload, without changing the underlying saved progress.
    await page.addInitScript(now=>{window.releaseClock=now;},start+minutes*60000);
    await page.reload();await page.locator('#square-tab').click();assert.equal(await page.locator('#mosslight').isDisabled(),true);
    await page.locator('#memories').click();assert.equal(await page.locator('#ending').evaluate(e=>e.open),true);await page.locator('#keep-playing').click();
    await page.setViewportSize({width:390,height:844});await page.locator('#village-tab').click();await page.locator('#gather').click();
    await page.locator('#settings').click();const downloaded=page.waitForEvent('download');await page.locator('#export-save').click();assert.equal((await downloaded).suggestedFilename(),'mosslight-village-backup.json');await page.locator('#close-settings').click();
    assert.deepEqual(errors,[]);
    console.log(`PASS: fresh-save browser progression to the ending in ${minutes} simulated minutes, earned resources only, saved completion, memories, phone free play, backup download, and all built assets served successfully.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
