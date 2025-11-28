if(typeof NetFunnel == "object"){

	//data:image/png;base64, 제외하고 값만 입력
	//base64 image encoding을 통해 사전에 이미지를 텍스트로 변환하여, 대기창이 처리되는 시점에 시스템 리소스를 사용하지 않도록 구현
	var logoData = 'iVBORw0KGgoAAAANSUhEUgAAAHAAAAAwCAMAAAD+Zg4VAAAAM1BMVEUWoamj2t214eRgv8VPuL4jpq76/f7///8yrLPw+fpCs7qQ09ZxxsvG6Op/zNDW7/Dj9PUKD269AAADBklEQVRYw+1YWVIkIRBlL3a4/2kHSHbKdgztipgJ+Wlt8uXLPVF0PXzQF+UZQkilT5k+fwl/Cb9EqNJ5lPDxtvgXCQM2BrtbZYqkOxJfESpHiIt34EiSXhI3QuVz2eVD3Y4grF5pLO6rVGANEtJsxvQbxBJ4EGKOxqELKLLpSro7QiKHBDczOOgJrEMjFBYtR4YBcXy94weh8KvEZC9ZbxCphMDHDCGYFv2yRzyU37nFBPegb4SAltYYD/4wsfBJn8BWNsaEwsXfmjpV8KyVQpEzVUML/EJY0JLUeJT425qMLM5r6kQB85gIFZ+tqhow/JyjxUcVRXkQArpHEbIDCLrECoJFE6HJ3891klnk1bXhuQj4TrijBStqs+ygniIc0KVrNkdL8SaJp+gOYxZCuaNjk/AjuPVklz1S3Z9Fq2kS5LpVVwnDiW6g7EhYblyuFeQOQ4rvJSr6HCtyJcyifpXA9auc/m0KlLa6gYQWSXlg9kmDWzBWcy1o19dp7R2hmwj34a6/Q8ihbGr81qCw5s6aBsGr01NI7Yk2oJ2LswCQQEeiaCP0h/278/EsGlaLhh0VVzocQbHuKSxaRVbP1a7NzNHWW6cCWlX1S0wFjA3ox6lBlR7DTW7xxt2CRohhYK1o2tvZ7z2cUdlqTrZ1xMZwsD0TBvUYN8Ji9lgvqqDDkO6MfanUIYtokVKmDmg20okkViXARZkWC2HJatqCCia0HCbBlEOaZIAgfTOOnScZHfuSzSDENWVVKF4rYS0FxKyF3TZyALsG8aR32qrFSrnsSTuNUEGXKx2vnbAxtuNHLyi23IDN0xasOl1cZvb0gOBGXCfhFWa9eH3SDNc4hknTasUUfm1dprd2aj9Byr6WFE8dYimdytfZbpUW2yuKVnD63ifF8+gSLx6cSnzy3lTBwQvN3Nx94yH88pR9z+OPvrw/OfTexfcRhuON8GbCvCPkf00Ybtbu24vGP0cIGyE8RahgI9jrIUJ2O9reTkg/+3v8Zwkl/vF/Knx8PPVOXA8S/uX5A79YfG+VbXswAAAAAElFTkSuQmCC';

	// 차단/block Skin, PC
	NetFunnel.SkinUtil.add('blockSkin',{
		prepareCallback:function(){
		},
		updateCallback:function(percent,nwait,totwait,timeleft){
		},
		htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:#ffffff; width:280px; height:100px; font-family:\'Noto Sans KR\', sans-serif;"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 10:00 부터 서비스 이용이 가능합니다. </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
	},'normal');

	// 차단/block Skin, mobile
	NetFunnel.SkinUtil.add('blockSkin',{
		prepareCallback:function(){
		},
		updateCallback:function(percent,nwait,totwait,timeleft){
		},
		htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:#ffffff; width:250px; height:100px; font-family:\'Noto Sans KR\', sans-serif;"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 10:00 부터 서비스 이용이 가능합니다. </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
	},'mobile');

	
	//ipBlockSkin, PC
	NetFunnel.SkinUtil.add('ipBlockSkin',{
		prepareCallback:function(){
		},
		updateCallback:function(percent,nwait,totwait,timeleft){
		},
		htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:white;border:1px solid black; width:300px"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 비정상적인 시도가 감지되어 접근을 차단합니다!!! </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
	},'normal');

	//ipBlockSkin, mobile
	NetFunnel.SkinUtil.add('ipBlockSkin',{
		prepareCallback:function(){
		},
		updateCallback:function(percent,nwait,totwait,timeleft){
		},
		htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:white;border:1px solid black; width:200px"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 비정상적인 시도가 감지되어 접근을 차단합니다!!! </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
	},'mobile');

/////////////////////////////////////////////////////////////////////////////////////////////////

	//skin1 PC
	NetFunnel.tstr = ' \
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff;border:1px solid #9ab6c4;width:620px;height:600px;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
			<div style="background-color:#ffffff;border:6px solid #eaeff3;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
				<div style="padding-top:0px;padding-left:25px;padding-right:25px"> \
					<h2>skin3</h2> \
					<div>  <iframe width="560" height="315" src="https://www.youtube.com/embed/6m4lR2oW_SI?rel=0;amp;autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div> \
					<div style="text-align:left;font-size:12pt;color:#001f6c;height:22px"><b>서비스 <span style="color:#013dc1">접속대기 중</span>입니다.</b></div> \
					<div style="text-align:right;font-size:9pt;color:#4d4b4c;padding-top:4px;height:17px" ><b>PC 예상대기시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false"></span></b></div> \
					<div style="padding-top:6px;padding-bottom:6px;vertical-align:center;width:560px;height:20px" id="NetFunnel_Loading_Popup_Progressbar"></div> \
					<div style="background-color:#ededed;width:560px;padding-bottom:8px;overflow:hidden"> \
						<div style="padding-left:5px"> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;padding-top:10px;height:10px">고객님 앞에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_Count" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명, 뒤에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_NextCnt" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명의 대기자가 있습니다.  </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px">현재 접속 사용자가 많아 대기 중이며, 잠시만 기다리시면 </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px;">서비스로 자동 접속 됩니다.</div> \
							<div style="text-align:center;font-size:9pt;color:#2a509b;padding-top:10px;"> \
								<b>※ 재 접속하시면 대기시간이 더 길어집니다. <span id="NetFunnel_Countdown_Stop" style="cursor:pointer">[중지]</span> </b> \
							</div> \
						</div> \
					</div> \
					<div style="height:5px;"></div> \
				</div> \
			</div> \
		</div>';
	NetFunnel.SkinUtil.add('skin1',{htmlStr:NetFunnel.tstr},'normal');

	//skin1 mobile
	NetFunnel.tstr = ' \
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff;border:1px solid #9ab6c4;width:620px;height:600px;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
			<div style="background-color:#ffffff;border:6px solid #eaeff3;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
				<div style="padding-top:0px;padding-left:25px;padding-right:25px"> \
					<h2>skin3</h2> \
					<div>  <iframe width="560" height="315" src="https://www.youtube.com/embed/6m4lR2oW_SI?rel=0;amp;autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div> \
					<div style="text-align:left;font-size:12pt;color:#001f6c;height:22px"><b>서비스 <span style="color:#013dc1">접속대기 중</span>입니다.</b></div> \
					<div style="text-align:right;font-size:9pt;color:#4d4b4c;padding-top:4px;height:17px" ><b>PC 예상대기시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false"></span></b></div> \
					<div style="padding-top:6px;padding-bottom:6px;vertical-align:center;width:560px;height:20px" id="NetFunnel_Loading_Popup_Progressbar"></div> \
					<div style="background-color:#ededed;width:560px;padding-bottom:8px;overflow:hidden"> \
						<div style="padding-left:5px"> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;padding-top:10px;height:10px">고객님 앞에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_Count" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명, 뒤에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_NextCnt" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명의 대기자가 있습니다.  </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px">현재 접속 사용자가 많아 대기 중이며, 잠시만 기다리시면 </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px;">서비스로 자동 접속 됩니다.</div> \
							<div style="text-align:center;font-size:9pt;color:#2a509b;padding-top:10px;"> \
								<b>※ 재 접속하시면 대기시간이 더 길어집니다. <span id="NetFunnel_Countdown_Stop" style="cursor:pointer">[중지]</span> </b> \
							</div> \
						</div> \
					</div> \
					<div style="height:5px;"></div> \
				</div> \
			</div> \
		</div>';
	NetFunnel.SkinUtil.add('skin1',{htmlStr:NetFunnel.tstr},'mobile');

/////////////////////////////////////////////////////////////////////////////////////////////////

	//기본 디자인 대기창, PC
	NetFunnel.SkinUtil.add('nfSkin',{
		htmlStr:'\
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff; width:438px; height:376px; font-family:\'Noto Sans KR\', sans-serif;"> \
			<div style="padding: 10px 10px 0px 20px;"> \
				<div style="padding-top:5px; padding-right:5px; font-size:10px !important;"> \
					<span style="text-align: left;"> \
							<img style="width:65px; height:30px; color:black; font-size:11px !important;" border=0 src="data:image/gif;base64,'+logoData+'" ></a>\
					</span> \
					<b style="text-align:right;"><span id="NetFunnel_Loding_Popup_Debug_Alerts" style="color:#ff0000;"></span></b> \
				</div> \
			</div> \
			<div style="padding-top:0px; padding-left:5px; padding-right:5px; line-height: initial !important;"> \
				<div style="box-sizing:initial; text-align:center; font-size:21px !important; color:#525252;"> \
					<b>서비스 <span style="color:#4F7FF9;">접속 대기 중</span>입니다.</b> \
				</div> \
				<div style="box-sizing:initial;text-align:center;font-size:18px !important;color:#525252;padding-top:4px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;"> \
					<b>예상 대기시간 :</b> \
						<span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false^font-size:18px !important;color:#525252;" style="color: #4F7FF9; font-size: 32px !important;"></span> \
				</div> \
				<div style="margin:auto; box-sizing: initial; padding-top: 6px; padding-bottom: 6px; width:270px; height:8px; visibility: visible;" id="NetFunnel_Loading_Popup_Progressbar"></div> \
				<div style="box-sizing:initial; width:100%; padding-bottom:8px; overflow:hidden; color:#6C6C6C; text-align:center; "> \
					<div style="padding-left:5px"> \
						<div style="box-sizing:initial;font-size:14px !important;text-align:center;padding:3px;padding-top:10px;white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">고객님 앞에 \
							<span style="color:#00BF08; font-size:24px !important; font-weight: bold;"> \
								<span id="NetFunnel_Loading_Popup_Count"></span><span style="font-weight:normal;font-size:14px !important;">명</span>\
							</span>\
							, 뒤에 \
							<b> \
								<span style="color:#00BF08;  font-weight: bold;"> \
									<span id="NetFunnel_Loading_Popup_NextCnt"></span><span style="font-weight:normal;font-size:14px !important;">명</span>\
								</span> \
							</b> \
							의 대기자가 있습니다. \
						</div> \
						<div style="box-sizing:initial;padding:3px;font-size:14px !important;">현재 접속 사용자가 많아 대기 중이며, 잠시만 기다리시면 </div> \
						<div style="box-sizing:initial;padding:3px;font-size:14px !important;">서비스로 자동 접속 됩니다.</div> \
						<div style="box-sizing:initial;padding-top:25px;font-size:14px !important;"> \
							<div id="NetFunnel_Countdown_Stop" style="box-sizing:initial; position:relative; cursor:pointer; margin:auto; width:50px; height:30px; border:1px solid #e8e8e8;line-height:27px;font-size:14px !important;"> \
							중지 </div> \
						</div> \
						<div style="box-sizing:initial;padding-top:10px;font-size:14px !important;"> \
							재 접속하시면 대기시간이 더 길어집니다. </div> \
					</div> \
				</div> \
				<div style="height:5px;"></div> \
			</div> \
		</div>'
	},'normal');

	//기본 디자인 대기창, mobile
	NetFunnel.SkinUtil.add('nfSkin',{
		htmlStr:'\
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff; width:290px; height:280px; font-family:\'Noto Sans KR\', sans-serif !important;"> \
			<div style="padding: 10px 10px 0px 20px;"> \
				<div style="padding-top:5px; padding-right:5px; line-height:25px;"> \
					<span style="text-align: left;"> \
						<img style="width:50px; height:auto; color:black; font-size:11px !important;" border=0 src="data:image/gif;base64,'+logoData+'" > </span> \
					<b style="text-align:right;"><span id="NetFunnel_Loding_Popup_Debug_Alerts" style="color:#ff0000;"></span></b> \
				</div> \
			</div> \
			<div style="padding-top:0px; padding-left:5px; padding-right:5px; line-height: initial;"> \
				<div style="box-sizing:initial; text-align:center; "> \
					<b style="font-size:16px !important; color:#525252;font-family:\'Noto Sans KR\', sans-serif !important;">서비스 <span style="color:#4F7FF9;">접속 대기 중</span>입니다.</b> \
				</div> \
				<div style="box-sizing:initial;text-align:center;font-size:15px !important;color:#525252;padding-top:4px;white-space:nowrap; text-overflow:ellipsis; overflow:hidden;font-family:\'Noto Sans KR\', sans-serif !important;"> \
					<b>예상 대기시간 :</b> \
						<span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false^font-size:15px !important;color:#525252;" style="color: #4F7FF9; font-size: 21px !important;"></span> \
				</div> \
				<div style="margin:auto; box-sizing: initial; padding-top: 6px; padding-bottom: 6px; width:190px; height:8px; visibility: visible;" id="NetFunnel_Loading_Popup_Progressbar"></div> \
				<div style="box-sizing:initial; width:100%; padding-bottom:8px; overflow:hidden; color:#6C6C6C; text-align:center; font-size:12px !important;"> \
					<div style="padding-left:5px"> \
						<div style="box-sizing:initial;text-align:center;padding:3px;padding-top:10px;white-space:nowrap; text-overflow:ellipsis; overflow:hidden;font-size:11px !important;font-weight:normal !important;font-family:\'Noto Sans KR\', sans-serif !important;">고객님 앞에 \
							<span style="color:#00BF08; font-size:11px !important; font-weight: bold !important;"> \
								<span id="NetFunnel_Loading_Popup_Count"></span><span style="font-weight:normal !important;font-size:11px !important;">명</span>\
							</span> \
							의 대기자가 있습니다. \
						</div> \
						<div style="padding:1px;font-size:11px !important;">현재 접속 사용자가 많아 대기 중이며, </div> \
						<div style="padding:1px;font-size:11px !important;">잠시만 기다리시면 </div> \
						<div style="padding:1px;font-size:11px !important;">서비스로 자동 접속 됩니다.</div> \
						<div style="padding-top:10px;"> \
							<div id="NetFunnel_Countdown_Stop" style="position:relative;box-sizing:initial; cursor:pointer; margin:auto; width:40px; height:25px; border:1px solid #e8e8e8;line-height:22px;font-size:11px !important;"> \
							중지 </div> \
						</div> \
						<div style="padding-top:5px;font-size:11px !important;"> \
							재 접속하시면 대기시간이 더 길어집니다. </div> \
					</div> \
				</div> \
				<div style="height:5px;"></div> \
			</div> \
		</div>'
	},'mobile');
}