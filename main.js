var pageNumber, startPage, totalPage;
var formdata;
   
function clearForm(){
    document.getElementById("searchForm").reset();
}

$.validator.addMethod("greaterThan", function(value, element, param) {
    if($.isNumeric($(param).val()))
        return this.optional(element) || parseInt(value) >= parseInt($(param).val());
    else 
        return true;
}, "Maximum price cannot be less than minimum price or below 0");

$(document).ready(function() { 
        pageNumber=1;
        startPage=1;
    
        $("#searchForm").validate({
            rules:{
                keywords: "required",
                minprice:{
                    number: true,
                    min: 0
                },
                maxprice:{
                    number: true,
                    min: 0,
                    greaterThan: "#minprice"
                },
                handletime:{
                    digits: true,
                    min: 1
                }
            },
            messages:{
                keywords: "Please enter key word",
                minprice:{
                    number: "Price should be a valid number",
                    min: "Minimum price cannot be below 0"
                },
                maxprice:{
                    number: "Price should be a valid number",
                    min: "Maximum price cannot be less than minimum price or below 0",
                },
                handletime:{
                    digits: "Max handling time should be a valid digit",
                    min: "Max handling time should be greater than or equal to 1"
                }
            },     
        
            highlight: function(element) {
                $(element).css('border-color', 'red');
            },
    
            unhighlight: function(element) {
                $(element).css('border-color', '#ffffff');
            },
        
        });
    
    
        $("#searchForm").submit(function(){
            if($("#searchForm").valid()){
                pageNumber=1;
                startPage=1;
                formdata=$(this).serialize();
                var data = formdata+"&pageNumber="+pageNumber;
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "ebay.php",
                    data: data,
                    success: function(data) {
                        var jsonObj=JSON.parse(data["json"]);
                        totalPage=Math.ceil(jsonObj.resultCount/jsonObj.itemCount);
                        displayPageBar(startPage,pageNumber);
                        displayResult(data["json"]);
                    }
                });
                return false;
            }
        });
 
});

window.fbAsyncInit = function() {
    FB.init({
      appId      : '1583023841939870',
      xfbml      : true,
      version    : 'v2.3'
    });
};

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));


$(document).on("click","#fbShare",function(){
    FB.ui(
            {
                method: 'feed',
                link: this.getAttribute("data-itemURL"),
                name: decodeURIComponent(this.getAttribute("data-title")),
                caption: "Search Information from eBay.com",
                picture: this.getAttribute("data-imgURL"),
                description: this.getAttribute("data-desc"),
            },
            function(response) {
                if (response && !response.error_code) {
                    alert('Posted Successfully');
                } 
                else {
                    alert('Not Posted');
                }
            }
   );
});
    
function pageClick(button){
    var prevPos=pageNumber%5;
    
    if(button.id=="prev"){
        if(pageNumber==1)
            $("#prev").addClass("disabled");
        else if(prevPos==1){
            startPage=startPage-5;
            pageNumber--;
        }
        else
            pageNumber--;
    }
    if(button.id=="next"){
        if(prevPos==0){
            startPage=startPage+5;
            pageNumber++;
        }
        else
            pageNumber++;
    }
    if(button.id == "pos1")
        pageNumber=startPage;
    if(button.id == "pos2")
        pageNumber=startPage+1;
    if(button.id == "pos3")
        pageNumber=startPage+2;
    if(button.id == "pos4")
        pageNumber=startPage+3;
    if(button.id == "pos5")
        pageNumber=startPage+4;
    
    displayPageBar(startPage,pageNumber);                     

    var data = formdata+"&pageNumber="+pageNumber;
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "ebay.php", 
        data: data,
        success: function(data) {
            displayResult(data["json"]);
        }
    });   
    
}


function displayPageBar(startPage, pageNumber){
    if(totalPage !=  "0" ){
        $("#pageBar").html("<ul class=\"pagination\" id=\"pagination\">"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"prev\"><a href=\"#\">&laquo;</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"pos1\"><a href=\"#\">"+startPage+"</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"pos2\"><a href=\"#\">"+(startPage+1)+"</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"pos3\"><a href=\"#\">"+(startPage+2)+"</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"pos4\"><a href=\"#\">"+(startPage+3)+"</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"pos5\"><a href=\"#\">"+(startPage+4)+"</a></li>"+
                           "<li onclick=\"pageClick(this);return false;\" id=\"next\"><a href=\"#\">&raquo;</a></li></ul>");
        if(pageNumber==1)
            $("#prev").addClass("disabled");
        var currentPos=pageNumber%5;
        if(currentPos==0)
            $("#pos5").addClass("active");
        else
            $("#pos"+currentPos).addClass("active");
        for(var i=0; i<5; i++){
            if(startPage+i>totalPage){
                $("#pos"+(i+1)).addClass("hide");
            }
        }
        if(startPage+5>totalPage)
            $("#next").addClass("hide");
    }
    else{
        for(var i=1; i<6; i++)
            $("#pos"+i).addClass("hide");
        $("#next").addClass("hide");
        $("#prev").addClass("hide");
    }
}
    

//If a node is empty, then change to NA
function parseEmpty(obj) {
    if(jQuery.isEmptyObject(obj))
       return "N/A";
    else 
        return obj;
}
function displayResult(data){
    var json=JSON.parse(data);
    var result = "";
    if(json.resultCount == "0")
        result += "<h1>No results found</h1>";
    else{
        var pn=parseInt(json.pageNumber), ic=parseInt(json.itemCount);
        result += "<h1>"+((pn-1)*ic+1)+"-"+Math.min((pn-1)*ic+ic,json.resultCount)+" items out of "+json.resultCount+"</h1>";
    }
    
    
    for(var i=0; i<Math.min(json.itemCount,json.resultCount-(pageNumber-1)*json.itemCount); i++){
        var itemi = "item"+i;
        var desc=""; 

        //shipping cost string and desc
        var shippingCost="";
         if(json[itemi].basicInfo.shippingServiceCost==0.0 || jQuery.isEmptyObject(json[itemi].basicInfo.shippingServiceCost)){
            shippingCost += json[itemi].basicInfo.convertedCurrentPrice+"&nbsp;(FREE Shipping)&nbsp;&nbsp;&nbsp;";
            desc += "Price: $"+json[itemi].basicInfo.convertedCurrentPrice+"(FREE Shipping),";
        }
        else{
            shippingCost += json[itemi].basicInfo.convertedCurrentPrice+"+$"+json[itemi].basicInfo.shippingServiceCost+" for shipping&nbsp;&nbsp;&nbsp;"; 
            desc += "Price: $"+json[itemi].basicInfo.convertedCurrentPrice+"+$"+json[itemi].basicInfo.shippingServiceCost+" for shipping,";
        }
        desc += "Location:"+parseEmpty(json[itemi].basicInfo.location);
    
        //top=reated string
        var topRatedIcon="";
        if(json[itemi].sellerInfo.topRatedSeller=="true")
            topRatedIcon = "<img src=\"image/itemTopRated.jpg\" class=\"smallIcon\">&nbsp;&nbsp;&nbsp;";
        
        //parameters to pass to facebook share function
        var itemURL = json[itemi].basicInfo.viewItemURL;
        var imgURL = json[itemi].basicInfo.galleryURL;
        var title = encodeURIComponent(json[itemi].basicInfo.title);
        
        //display item row
        result += "<div class=\"media\">"+
                        "<a class=\"pull-left\" href=\"#\" data-toggle=\"modal\" data-target=\"#largeImg"+i+"\">"+
                        "<img class=\"media-object smallImg\" src=\""+json[itemi].basicInfo.galleryURL+"\"></a>"+
                            "<div class=\"media-body\">"+
                                "<h4 class=\"media-heading\"><a href=\""+json[itemi].basicInfo.viewItemURL+"\">"+json[itemi].basicInfo.title+"</a></h4>"+
                                "<strong>Price: $"+shippingCost+"</strong>"+
                                "<i>Location:"+parseEmpty(json[itemi].basicInfo.location)+"</i>&nbsp;&nbsp;"+
                                topRatedIcon+
                                "<a data-toggle=\"collapse\" data-target=\"#details"+i+"\">View Details&nbsp;&nbsp;&nbsp;</a>"+
                                "<a id=\"fbShare\" href=\"#\" data-title=\""+title+"\" data-itemURL=\""+itemURL+"\" data-imgURL=\""+imgURL+"\" data-desc=\""+desc+"\"><img src=\"image/fb.png\" class=\"smallIcon\"></a>"+
                            "</div>"+
                  "</div>";
        
        //display detail tabs
        result += "<div class=\"row\">"+
                        "<div id=\"details"+i+"\" class=\"collapse out detailtab\">"+generateDetails()+"</div>"+
                        "</div>"+
                  "</div>";
        
        //modal
        result += "<div id=\"largeImg"+i+"\" class=\"modal fade\" role=\"dialog\" tabindex=\"-1\" aria-labelledby=\"largeModal\" aria-hidden=\"true\">\
                    <div class=\"modal-dialog\">\
                        <div class=\"modal-content\">\
                            <div class=\"modal-header\">\
                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\
                                <h4 class=\"modal-title\">"+json[itemi].basicInfo.title+"</h4>\
                            </div>\
                            <div class=\"modal-body\"><img class=\"modalImg\" src=\""+json[itemi].basicInfo.pictureURLSuperSize+"\">\
                            </div>\
                        </div>\
                  </div>\
                </div>";

    }
    //detail tab    
    function generateDetails(){
        var details="";
        details += "<ul class=\"nav nav-tabs\">";
        details += "<li class=\"active\"><a data-toggle=\"tab\" href=\"#basicInfo"+i+"\">Basic Info</a></li>";
        details += "<li><a data-toggle=\"tab\" href=\"#sellerInfo"+i+"\">Seller Info</a></li>";
        details += "<li><a data-toggle=\"tab\" href=\"#shippingInfo"+i+"\">Shipping Info</a></li>";
        details += "</ul>";
        details += "<div class=\"tab-content\">";
        //basic info
        details += "<div id=\"basicInfo"+i+"\" class=\"tab-pane fade in active\">"+generateBasicInfo()+"</div>";
        details += "<div id=\"sellerInfo"+i+"\" class=\"tab-pane fade\">"+generateSellerInfo()+"</div>";
        details += "<div id=\"shippingInfo"+i+"\" class=\"tab-pane fade\">"+generateShippingInfo()+"</div></div>";
        
        function split(obj){
            if(jQuery.isEmptyObject(obj))
                return "N/A"
            else{
                var str = obj;
                var arr = str.split(/(?=[A-Z])/);
                var res = "";
                for(var i=0; i<arr.length; i++)
                        res += arr[i] +" ";
                return res;
            }
        }
        function generateBasicInfo(){
            var basic="";
            basic += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Category name</strong></div>";
            basic += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].basicInfo.categoryName)+"</div></div>";
            basic += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Condition</strong></div>";
            basic += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].basicInfo.conditionDisplayName)+"</div></div>";
            basic += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Buying format</strong></div>";
            basic += "<div class=\"col-sm-5\">"+split(json[itemi].basicInfo.listingType)+"</div></div><br><br>";
            return basic;
        }
        function generateSellerInfo(){
            var seller="";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>User name</strong></div>";
            seller += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].sellerInfo.sellerUserName)+"</div></div>";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Feedback score</strong></div>";
            seller += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].sellerInfo.feedbackScore)+"</div></div>";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Positive feedback</strong></div>";
            seller += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].sellerInfo.positiveFeedbackPercent)+"</div></div>";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Feedback rating</strong></div>";
            seller += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].sellerInfo.feedbackRatingStar)+"</div></div>";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Top rated</strong></div>";
                if(json[itemi].sellerInfo.topRatedSeller=="true")
                    seller += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-ok greenIcon\"></span></div></div>";
                else
                    seller += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-remove redIcon\"></span></div></div>";
            seller += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Store</strong></div>";
                if(jQuery.isEmptyObject(json[itemi].sellerInfo.sellerStoreName))
                    seller += "<div class=\"col-sm-5\">N/A</div></div>";
                else if(jQuery.isEmptyObject(json[itemi].sellerInfo.sellerStoreURL))
                    seller += "<div class=\"col-sm-5\">"+json[itemi].sellerInfo.sellerStoreName+"</div></div>";
                else
                    seller += "<div class=\"col-sm-5\"><a href=\""+json[itemi].sellerInfo.sellerStoreURL+"\">"+json[itemi].sellerInfo.sellerStoreName+"</a></div></div><br><br>";
            return seller;       
        }
        function generateShippingInfo(){
            var shipping="";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Shipping type</strong></div>";
            shipping += "<div class=\"col-sm-5\">"+split(json[itemi].shippingInfo.shippingType)+"</div></div>";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Handling time</strong></div>";
                if(jQuery.isEmptyObject(json[itemi].shippingInfo.handlingTime))
                    shipping += "<div class=\"col-sm-5\">N/A</div></div>";
                else
                    shipping += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].shippingInfo.handlingTime)+" day(s)</div></div>";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Shipping locations</strong></div>";
            shipping += "<div class=\"col-sm-5\">"+parseEmpty(json[itemi].shippingInfo.shipToLocations)+"</div></div>";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Expedited shipping</strong></div>";
                if(json[itemi].shippingInfo.expeditedShipping=="true")
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-ok greenIcon\"></span></div></div>";
                else
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-remove redIcon\"></span></div></div>";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>One day shipping</strong></div>";
                if(json[itemi].shippingInfo.oneDayShippingAvailable=="true")
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-ok greenIcon\"></span></div></div>";
                else
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-remove redIcon\"></span></div></div>";
            shipping += "<div class=\"row\"><div class=\"col-sm-3\"><strong>Returns accepted</strong></div>";
                if(json[itemi].shippingInfo.returnsAccepted=="true")
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-ok greenIcon\"></span></div></div>";
                else
                    shipping += "<div class=\"col-sm-5\"><span class=\"glyphicon glyphicon-remove redIcon\"></span></div></div><br><br>";
            return shipping;
        }
        
        return details;
    }
    
    $("#results").html(result);
}
    