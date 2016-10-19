<?php
error_reporting(0);

// initiate url
$appkey = "USCcc04da-be0e-426d-b7bd-582336ae77f";

if ($_GET["sortby"]=="Best Match")
    $sortOrder="BestMatch";
else if ($_GET["sortby"]=="Price:highest first")
    $sortOrder="CurrentPriceHighest"; 
else if ($_GET["sortby"]=="Price+Shipping:highest first")
    $sortOrder="PricePlusShippingHighest";
else
    $sortOrder="PricePlusShippingLowest";

$url = "http://svcs.eBay.com/services/search/FindingService/v1?siteid=0&SECURITY-APPNAME=".$appkey."&OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=XML&keywords=".urlencode($_GET["keywords"])."&paginationInput.entriesPerPage=".$_GET["perpage"]."&sortOrder=".$sortOrder;

//add conditions to url
$i=-1;
if(trim($_GET["minprice"])!==""){
    $i++;
    $url .= "&itemFilter[".$i."].name=MinPrice&itemFilter[".$i."].value=".$_GET["minprice"];
}
if(trim($_GET["maxprice"])!==""){
    $i++;
    $url .= "&itemFilter[".$i."].name=MaxPrice&itemFilter[".$i."].value=".$_GET["maxprice"];
}
if($_GET["new"] || $_GET["used"] || $_GET["verygood"] || $_GET["good"] || $_GET["acceptable"]){
    $i++;
    $j=0;
    $url .= "&itemFilter[".$i."].name=Condition";
    if($_GET["new"]){
        $url .="&itemFilter[".$i."].value[".$j."]=1000";
        $j++;
    }
    if($_GET["used"]){
        $url .="&itemFilter[".$i."].value[".$j."]=3000";
        $j++;
    }
    if($_GET["verygood"]){
        $url .="&itemFilter[".$i."].value[".$j."]=4000";
        $j++;
    }
    if($_GET["good"]){
        $url .="&itemFilter[".$i."].value[".$j."]=5000";
        $j++;
    }
    if($_GET["acceptable"]){
        $url .="&itemFilter[".$i."].value[".$j."]=6000";
    }
}
if($_GET["buynow"] || $_GET["auction"] || $_GET["ads"]){
    $i++;
    $j=0;
    $url .= "&itemFilter[".$i."].name=ListingType";
    if($_GET["buynow"]){
        $url .="&itemFilter[".$i."].value[".$j."]=FixedPrice";
        $j++;
    }
    if($_GET["auction"]){
        $url .="&itemFilter[".$i."].value[".$j."]=Auction";
        $j++;
    }
    if($_GET["ads"]){
        $url .="&itemFilter[".$i."].value[".$j."]=Classified";
    }
}
if($_GET["return"]){
    $i++;
    $url .= "&itemFilter[".$i."].name=ReturnsAcceptedOnly&itemFilter[".$i."].value=true";
}
if($_GET["freeship"]){
    $i++;
    $url .= "&itemFilter[".$i."].name=FreeShippingOnly&itemFilter[".$i."].value=true";
}
if($_GET["expship"]){
    $i++;
    $url .= "&itemFilter[".$i."].name=ExpeditedShippingType&itemFilter[".$i."].value=Expedited";
}
if($_GET["handletime"]){
    $i++;
    $url .= "&itemFilter[".$i."].name=MaxHandlingTime&itemFilter[".$i."].value=".$_GET["handletime"];
}

$url .= "&outputSelector[1]=SellerInfo&outputSelector[2]=PictureURLSuperSize&outputSelector[3]=StoreInfo&paginationInput.pageNumber=".$_GET["pageNumber"];
     
//parse xml and encode into JSON
$xml=simplexml_load_file($url);
$newxml=new SimpleXMLElement("<root></root>");
$newxml->addChild("ack");
    $newxml->ack=$xml->ack;
$newxml->addChild("resultCount");
    $newxml->resultCount=$xml->paginationOutput->totalEntries;
$newxml->addChild("pageNumber");
    $newxml->pageNumber=$xml->paginationOutput->pageNumber;
$newxml->addChild("itemCount");
    $newxml->itemCount=$xml->paginationOutput->entriesPerPage;

if($newxml->resultCount!=0){
        for($i=0; $i<min($xml->paginationOutput->totalEntries-($xml->paginationOutput->pageNumber-1)*$xml->paginationOutput->entriesPerPage, $xml->paginationOutput->entriesPerPage); $i++){
            $itemi="item".$i."";
            $newxml->addChild($itemi);
            
            //basicInfo
            $newxml->$itemi->addChild("basicInfo");
                $newxml->$itemi->basicInfo->addChild("stitle"); 
                    $newxml->$itemi->basicInfo->title=$xml->searchResult->item[$i]->title;
                $newxml->$itemi->basicInfo->addChild("viewItemURL");
                    $newxml->$itemi->basicInfo->viewItemURL=$xml->searchResult->item[$i]->viewItemURL;
                $newxml->$itemi->basicInfo->addChild("galleryURL");
                    $newxml->$itemi->basicInfo->galleryURL=$xml->searchResult->item[$i]->galleryURL;
                $newxml->$itemi->basicInfo->addChild("pictureURLSuperSize");
                    $newxml->$itemi->basicInfo->pictureURLSuperSize=$xml->searchResult->item[$i]->pictureURLSuperSize;
                $newxml->$itemi->basicInfo->addChild("convertedCurrentPrice");
                    $newxml->$itemi->basicInfo->convertedCurrentPrice=$xml->searchResult->item[$i]->sellingStatus->convertedCurrentPrice;
                $newxml->$itemi->basicInfo->addChild("shippingServiceCost");
                    $newxml->$itemi->basicInfo->shippingServiceCost=$xml->searchResult->item[$i]->shippingInfo->shippingServiceCost;
                $newxml->$itemi->basicInfo->addChild("conditionDisplayName");
                    $newxml->$itemi->basicInfo->conditionDisplayName=$xml->searchResult->item[$i]->condition->conditionDisplayName;
                $newxml->$itemi->basicInfo->addChild("listingType");
                    $newxml->$itemi->basicInfo->listingType=$xml->searchResult->item[$i]->listingInfo->listingType;
                $newxml->$itemi->basicInfo->addChild("location");
                    $newxml->$itemi->basicInfo->location=$xml->searchResult->item[$i]->location;
                $newxml->$itemi->basicInfo->addChild("categoryName");
                    $newxml->$itemi->basicInfo->categoryName=$xml->searchResult->item[$i]->primaryCategory->categoryName;
                $newxml->$itemi->basicInfo->addChild("topRatedListing", $xml->searchResult->item[$i]->topRatedListing);
            
            //sellerInfo
            $newxml->$itemi->addChild("sellerInfo");
                $newxml->$itemi->sellerInfo->addChild("sellerUserName");
                    $newxml->$itemi->sellerInfo->sellerUserName=$xml->searchResult->item[$i]->sellerInfo->sellerUserName;
                $newxml->$itemi->sellerInfo->addChild("feedbackScore");
                    $newxml->$itemi->sellerInfo->feedbackScore=$xml->searchResult->item[$i]->sellerInfo->feedbackScore;
                $newxml->$itemi->sellerInfo->addChild("positiveFeedbackPercent");
                    $newxml->$itemi->sellerInfo->positiveFeedbackPercent=$xml->searchResult->item[$i]->sellerInfo->positiveFeedbackPercent;
                $newxml->$itemi->sellerInfo->addChild("feedbackRatingStar");
                    $newxml->$itemi->sellerInfo->feedbackRatingStar=$xml->searchResult->item[$i]->sellerInfo->feedbackRatingStar;
                $newxml->$itemi->sellerInfo->addChild("topRatedSeller");
                    $newxml->$itemi->sellerInfo->topRatedSeller=$xml->searchResult->item[$i]->sellerInfo->topRatedSeller;
                $newxml->$itemi->sellerInfo->addChild("sellerStoreName");
                     $newxml->$itemi->sellerInfo->sellerStoreName=$xml->searchResult->item[$i]->storeInfo->storeName;
                $newxml->$itemi->sellerInfo->addChild("sellerStoreURL");
                    $newxml->$itemi->sellerInfo->sellerStoreURL=$xml->searchResult->item[$i]->storeInfo->storeURL;
            
            //shippingInfo
            $newxml->$itemi->addChild("shippingInfo");
                $newxml->$itemi->shippingInfo->addChild("shippingType");
                    $newxml->$itemi->shippingInfo->shippingType=$xml->searchResult->item[$i]->shippingInfo->shippingType;
                $j=0;
                while(!empty($xml->searchResult->item[$i]->shippingInfo->shipToLocations[$j])){
                    $newxml->$itemi->shippingInfo->addChild("shipToLocations");
                    $newxml->$itemi->shippingInfo->shipToLocations[$j]=$xml->searchResult->item[$i]->shippingInfo->shipToLocations[$j];
                    $j++;
                }
                $newxml->$itemi->shippingInfo->addChild("expeditedShipping");
                    $newxml->$itemi->shippingInfo->expeditedShipping=$xml->searchResult->item[$i]->shippingInfo->expeditedShipping;
                $newxml->$itemi->shippingInfo->addChild("oneDayShippingAvailable");
                    $newxml->$itemi->shippingInfo->oneDayShippingAvailable=$xml->searchResult->item[$i]->shippingInfo->oneDayShippingAvailable;
                $newxml->$itemi->shippingInfo->addChild("returnsAccepted");
                    $newxml->$itemi->shippingInfo->returnsAccepted=$xml->searchResult->item[$i]->returnsAccepted;
                $newxml->$itemi->shippingInfo->addChild("handlingTime");
                    $newxml->$itemi->shippingInfo->handlingTime=$xml->searchResult->item[$i]->shippingInfo->handlingTime;
        }
}


$response["json"]=json_encode($newxml);
echo json_encode($response);

?>