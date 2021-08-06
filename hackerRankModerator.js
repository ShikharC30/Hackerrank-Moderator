const puppeteer=require("puppeteer");
let brow;
(async function(){
    try{
        let browser= await puppeteer.launch({headless: false,
            defaultViewport:null,
            args:["--start-maximized"] 
        });
        brow=browser;
        let pages=await browser.pages();
        page=pages[0];
        let openPage=await page.goto("https://www.hackerrank.com/administration/challenges/page/1");
        await page.waitForSelector("#login.fw",{visible:true});
        await page.type("#login.fw","nomoxih297@farthy.com");
        await page.type('input[placeholder="Your password"]',"1234567890");
        // await page.click(".btn.btn-primary.span4.block-center.login-button.auth");
        await Promise.all([page.waitForNavigation({waitUntil:"networkidle0"}),page.click(".btn.btn-primary.span4.block-center.login-button.auth")]);
        // let allLinks=await page.$$(".backbone.block-center");
        // let challengeLinks=[];
        // for(let i=0;i<allLinks.length;i++){
        //     let link=await page.evaluate(function(ele){
        //         return ele.getAttribute("href");
        //     },allLinks[i])
        //     challengeLinks.push(link);
        // }
        // let completelinks=[];
        // for(let i=0;i<challengeLinks.length;i++){
        //     complete="https://www.hackerrank.com"+challengeLinks[i];
        //     completelinks.push(complete);
        // }
        // for(let i=0;i<completelinks.length;i++){
        //      addModerators(completelinks[i]);
        // }
        await add(page);
    }
    catch(error){
            console.log(error);
    }
})();

async function add(newTab){
    try{
        await page.waitForSelector(".backbone.block-center");
        //yaha pe jab naya page aayega function mai toh ek baar wait kar lo and fir aage badho
        let allLinks=await page.$$(".backbone.block-center");
            let challengeLinks=[];
            for(let i=0;i<allLinks.length;i++){
                let link=await page.evaluate(function(ele){
                    return ele.getAttribute("href");
                },allLinks[i])
                challengeLinks.push(link);
            }
            let completelinks=[];
            for(let i=0;i<challengeLinks.length;i++){
                complete="https://www.hackerrank.com"+challengeLinks[i];
                completelinks.push(complete);
            }
            let donePromise=[]
            for(let i=0;i<completelinks.length;i++){
                let comp=addModerators(completelinks[i]);
                donePromise.push(comp);
            }
            //yaha pe agar yeh likh du await addModerators(completelinks[i]); toh ek ek karke kaam hoga abhi sab ek saath ho raha hai
            await Promise.all(donePromise);
            
            let allLis=await newTab.$$(".pagination li");
            // console.log(allLis)
            let nxtBtn=allLis[allLis.length-2];
            let isDisabled=await newTab.evaluate(function(ele){
                ele.classList.contains("disabled"); 
            },nxtBtn);
            //classList checks ki uss element ki classList matlab uspr joh saare classes hai usme se koi contains() returns true/false
            //tab.evaluate joh hai na is used to use those functions that are written on Doms unko yaha use karne ke liye
            //tab.evaluate( function(ele) {return joh bhi aapko karna hai; } , ele )
            if(isDisabled){
                return;
            }
            else{
                await Promise.all([newTab.waitForNavigation({waitUntil:"networkidle0"}),nxtBtn.click()]);
                await add(newTab);
            }
    }
    catch(err){
        console.log(err);
    }
}

async function addModerators(link){
    await addModeratorToASinglePage(link);
}

async function addModeratorToASinglePage(l){
    try{
        let newTab=await brow.newPage();
        await newTab.goto(l);
        await newTab.waitForSelector('li[data-tab="moderators"]',{visible:true,timeout:30000});
        await newTab.click('li[data-tab="moderators"]');
        await handleConfirmationBox(newTab);
        
        await newTab.waitForSelector('#moderator',{visible:true});
        await newTab.type('#moderator','Steph');
        await newTab.click('.btn.moderator-save');
        await newTab.click('.save-challenge.btn.btn-green');
        await newTab.close();

        
    }
    catch(err){
        console.log(err);
    }
}

async function handleConfirmationBox(newTab){
    try{
        await newTab.waitForSelector('#cancelBtn',{visible:true,timeout:1000});//yaha kya scene hai ki agar timeout nhi lagaya na toh 30sec tak wait
        //karega tab tak doosre tab pe nhi jayega kyuki await laga hai and doosre tab mai bhi moderator tab clickhona bacha hai toh jab tak yeh nhi
        //hota 30sec tak tab tak voh bhi hold pe rahega toh uske 30sec khatam ho jayenge aur voh error de dega isiliye idhar timeout lagana padha
        //taaki waitForSelector('li[data-tab="moderators"]',{visible:true,timeout:30000}); isme timeout na aaye
        await newTab.click("#cancelBtn");
    }
    catch(err){
        console.log("modal not found");
        return;
    }
}