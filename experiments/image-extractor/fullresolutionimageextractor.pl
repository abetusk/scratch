#!/usr/bin/perl

#AUTHOR: Kalev Leetaru (kalev.leetaru5@gmail.com) (http://www.kalevleetaru.com/)
#NOTE: requires ImageMagick's "convert" (http://www.imagemagick.org/), Kakadu Software's "kdu_buffered_expand" (http://www.kakadusoftware.com/), and CJPEG (http://jpegclub.org/cjpeg/), as well as "wget" and "zip"
#USAGE: ./fullresolutionimageextractor.pl IDENTIFIER_TO_PROCESS

#############################################################################################
#and the absolute path to where we are running...
use Cwd 'abs_path';
$dirname = abs_path($0); $dirname=~s/\/[^\/]+$//;
$CACHEDIR = "$dirname/CACHE/";
#############################################################################################
#get our file to process...
$INFILE = $ARGV[0];
if (length($INFILE) < 5) {print "USAGE: ./fullresolutionimageextractor.pl IDENTIFIER_TO_PROCESS\n"; exit;}
mkdir("$CACHEDIR/"); mkdir("$dirname/ZIPCACHE/");
system("rm -rf $CACHEDIR/$INFILE");
mkdir("$CACHEDIR/$INFILE");
#############################################################################################
#first access its file list, determine whether it has the Abbyy file and the page images files, and then download the right files...
system("wget -q http://archive.org/download/$INFILE -O $CACHEDIR/$INFILE/filelist.html");
$buf = ''; open(FILE, "$CACHEDIR/$INFILE/filelist.html"); read(FILE, $buf, (-s FILE)); close(FILE);
$abbyurl = ''; $jpgurl = ''; $jp2url = ''; $tiffurl = ''; $imageurl = ''; $scandataurl = ''; $scandatazipurl = '';
while($buf=~/<a href="([^"]+)"/g) {
    ($url) = ($1);
    if ($url=~/_abbyy\.gz/) {$abbyyurl = $url;}
    if ($url=~/_jpg\.zip/) { $jpgurl = $url; $EXT = 'jpg'; }
    if ($url=~/_jp2\.zip/) { $jp2url = $url; $EXT = 'jp2'; }
    #if ($url=~/_tif\.zip/) {$tiffurl = $url;} #disable TIFF images for now as they tend to be lower quality...
    if ($url=~/_scandata\.xml/) {$scandataurl = $url;}
}
if ($jpgurl ne '') {$imageurl = $jpgurl;} else {$imageurl = $jp2url;}
#if ($imageurl eq '' && $tiffurl ne '') {$imageurl = $tiffurl;}
if ($abbyyurl eq '' || $imageurl eq '' || $scandataurl  eq '') {
    #we couldn't get a file list - clean up and bail...
    system("rm -rf $CACHEDIR/$INFILE/");
    exit;
}
$imageinternalurl = $imageurl; $imageinternalurl=~s/\.zip//;
undef($buf); #free the memory...
################################
#create the filename for the images... NOTE - can't just drop all after "_" as there are filenames like "PMLP09691-morley_1597"...
$IMAGEINFILE = $imageurl;
$IMAGEINFILE=~s/_jpg\.zip//;
$IMAGEINFILE=~s/_jp2\.zip//;
#$IMAGEINFILE=~s/_tif\.zip//; #disable TIFF images for now as they tend to be lower quality...
################################
#and download to disk and unpack...
system("wget -q --no-check-certificate http://archive.org/download/$INFILE/$abbyyurl -O $CACHEDIR/$INFILE/abbyyurl.gz");
if ($scandataurl ne '') {system("wget -q --no-check-certificate http://archive.org/download/$INFILE/$scandataurl -O $CACHEDIR/$INFILE/scandata.xml");}
################################
#verify that we were able to successfully download both of them... actually, now we do the images download a bit later after we verify that there are enough images in this book to make it worth our while...
if (-s "$CACHEDIR/$INFILE/abbyyurl.gz" < 10000 || -s "$CACHEDIR/$INFILE/scandata.xml" < 10000) {
    system("rm -rf $CACHEDIR/$INFILE/");
    exit;
}
################################
#now unpack them...
system("gunzip -q $CACHEDIR/$INFILE/abbyyurl.gz");
################################
#############################################################################################
#read in the scandata and find our droppages...
undef(%DROPPAGE); undef(%SKIPPAGE); $MINPAGEID = ''; $MAXPAGEID = 0;
if (-s "$CACHEDIR/$INFILE/scandata.xml" > 1000) {
    $buf = ''; open(FILE, "$CACHEDIR/$INFILE/scandata.xml"); read(FILE, $buf, (-s FILE)); close(FILE);
    while($buf=~/<page leafNum="(\d+)">(.*?)<\/page>/gs) {
	($pageid, $block) = ($1, $2);
	if ($MINPAGEID eq '') { $MINPAGEID = $pageid; } #save our first pageid, as this tells us 0/1 that we use for the next section...
	if ($pageid > $MAXPAGEID) {$MAXPAGEID = $pageid;}
	if ($block=~/<addToAccessFormats>false<\/addToAccessFormats>/) {$DROPPAGE{$pageid} = 1;}
	if ($block=~/<pageType>Cover<\/pageType>/) {$SKIPPAGE{$pageid} = 1;}
    }
}
$ENDBOUNDARY = $MAXPAGEID - 4; #this is used to create a boundary at the end of the book to drop images right at the end...
undef($buf); #free this memory...
#############################################################################################
#do a preliminary pass through the Abbyy file to count up the images and their distribution to act as a blacklist for books that don't have sufficient images...
$PAGENUM = $MINPAGEID - 1; $IAPAGENUM = -1;
$GOODIMAGES = 0;
undef(%PAGEHASIMAGES);
open(FILE, "$CACHEDIR/${INFILE}/abbyyurl");
while(<FILE>) {
    if (index($_, '<page') > -1) {
	$PAGENUM++;
	if (!exists($DROPPAGE{$PAGENUM})) { $IAPAGENUM++; }
    }
    if (index($_, '<block blockType="Picture"') > -1 && !exists($DROPPAGE{$PAGENUM})) {
    	$attrs = ''; ($attrs) = $_=~/<block blockType="Picture"([^>]+)/;
	($l, $t, $r, $b) = $attrs=~/l="(\d+)" t="(\d+)" r="(\d+)" b="(\d+)"/; $width = $r - $l; $height = $b - $t;
	if ($width > 300 && $height > 300) {
	    if ($PAGENUM > 4 && $PAGENUM < $ENDBOUNDARY) { $GOODIMAGES++; $PAGEHASIMAGES{$PAGENUM}=1; }
	}
    }
}
close(FILE);
$numpageswithimages = scalar(keys %PAGEHASIMAGES);
if ($GOODIMAGES < 4 || $numpageswithimages < 3) {
    #there aren't enough images in this book to bother with, so skip it and move on...
    print "\t\tFAIL-NOTENOUGHIMAGES: ($INFILE) NPGS($numpageswithimages) GIMGS($GOODIMAGES) MAXPAGE($MAXPAGEID) MIN($MINPAGEID) BOUND($ENDBOUNDARY)\n";
    system("rm -rf $CACHEDIR/$INFILE/");
    exit;    
}
#############################################################################################
#otherwise, if we reach this point, there are enough images in this book to make it worth our while to process it, so NOW download its images...
#make a decision based on the number of pages with images, if it is less than 50, then fetch via IA's API, otherwise download the entire images ZIP file...
if ($numpageswithimages > 50) {
    system("wget -q --no-check-certificate http://archive.org/download/$INFILE/$imageurl -O $CACHEDIR/$INFILE/images.zip");
    print "\tDOWNLOADED($INFILE) IMGS($GOODIMAGES/$numpageswithimages) TPG($MAXPAGEID)\n";
    if (-s "$CACHEDIR/$INFILE/images.zip" < 10000) {
        system("rm -rf $CACHEDIR/$INFILE/");
        exit;
    }
    $IMAGESTAT = 1; #indicates imagezip is onsite...
} else {
    #indicates images should be fetched ondemand...
    $IMAGESTAT = 2;
    mkdir("$CACHEDIR/$INFILE/images/"); #make the images subdirectory, as otherwise wget will error and fail to write...
} 
print "\tDOWNLOADED($INFILE) IMGS($GOODIMAGES/$numpageswithimages) TPG($MAXPAGEID) FETCHTYPE($IMAGESTAT)\n";
#############################################################################################
#read the Abbyy file in and parse it down to just newpages and images...
$PAGENUM = $MINPAGEID - 1; $IAPAGENUM = -1;
open(FILE, "$CACHEDIR/${INFILE}/abbyyurl");
while(<FILE>) {
    if (index($_, '<page') > -1) {
	$PAGENUM++;
	if ($PAGENUM == 0) {$BUF = '';} 
	if (!exists($DROPPAGE{$PAGENUM})) { $IAPAGENUM++; }
    }
    $_=~s/<block blockType="Picture"([^>]+)>/KALEVIMAGE{$PAGENUM}{$IAPAGENUM}{$1}/;
    $_=~s/&quot;//g; $_=~s/&apos;//g;
    $_=~s/<[^>]+>//g;
    if (!exists($DROPPAGE{$PAGENUM})) { $_=~s/\s+/ /g; $BUF .= $_; }
}
close(FILE);
$BUF=~s/\s+/ /gs;
#############################################################################################
$IMAGEID = 0;
open(CMDS, ">$CACHEDIR/${INFILE}/cmds.sh"); print CMDS "#!/bin/sh\ncd $dirname/\n";
print CMDS "LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$dirname\nexport LD_LIBRARY_PATH\n";
$CMDSBUF_UNPACK = ''; undef(%UNPACKEDPAGE);
$CMDSBUF_PROCESS = '';
mkdir("$CACHEDIR/${INFILE}_imgs");
open(OUT, ">$CACHEDIR/${INFILE}_imgs/$INFILE.imageslist.txt");
print OUT "Identifier\tPageNumber\tImageID\tWidth\tHeight\tImageFileName\tAccessURL\tPreText\tPostText\n";
while($BUF=~/KALEVIMAGE{([^}]+)}{([^}]+)}{([^}]+)}/g) {
    ($pagenum, $iapagenum, $attrs) = ($1, $2, $3); $len = length($pagenum) + length($iapagenum) + length($attrs) + 16;
    ($l, $t, $r, $b) = $attrs=~/l="(\d+)" t="(\d+)" r="(\d+)" b="(\d+)"/; $width = $r - $l; $height = $b - $t;
    if ($width > 200 && $height > 200 && $pagenum > -1 && $pagenum > 4 && $pagenum < $ENDBOUNDARY && !exists($SKIPPAGE{$pagenum})) { 
	$pos = pos($BUF);
	$pre = substr($BUF, $pos - $len - 1000, 1000); $pre=~s/.*}//; $pre=~s/^\s+//; $pre=~s/\s+$//;
	$post = substr($BUF, $pos, 1000); $post=~s/KALEVIMAGE.*//; $post=~s/^\s+//; $post=~s/\s+$//;
	$rawfilepagenum = sprintf("%04d", $pagenum);
	$iafilepagenum = sprintf("%04d", $iapagenum);
	print OUT "$INFILE\t$iapagenum\t$IMAGEID\t$width\t$height\t${INFILE}.img.$IMAGEID.${iafilepagenum}.jpg\thttps://archive.org/stream/$INFILE/$IMAGEINFILE#page/n$iapagenum/mode/1up\t$pre\t$post\n";
	if ($EXT eq 'jp2') {
	    #use the accelerated Kakadu/CJPEG pipeline for JPEG2000 files... 
	    if (!exists($UNPACKEDPAGE{$rawfilepagenum})) {
		if ($IMAGESTAT == 1) {$CMDSBUF_UNPACK .= "unzip -q -j -d $CACHEDIR/$INFILE/images/ $CACHEDIR/$INFILE/images.zip $imageinternalurl/${IMAGEINFILE}_${rawfilepagenum}.$EXT\n";}
		elsif ($IMAGESTAT == 2) {$CMDSBUF_UNPACK .= "wget -q --no-check-certificate \"http://archive.org/download/$INFILE/$imageurl/$imageinternalurl/${IMAGEINFILE}_${rawfilepagenum}.$EXT\" -O $CACHEDIR/$INFILE/images/${IMAGEINFILE}_${rawfilepagenum}.$EXT\n";}
		$UNPACKEDPAGE{$rawfilepagenum} = 1;
	    }
	    $CMDSBUF_PROCESS .= "./kdu_buffered_expand -i $CACHEDIR/$INFILE/images/${IMAGEINFILE}_${rawfilepagenum}.$EXT -o $CACHEDIR/$INFILE/images/KDUCONVERT.ppm -num_threads 0 -int_region \"{$t,$l},{$height,$width}\" > /dev/null 2>&1\n";
	    $CMDSBUF_PROCESS .=  "./cjpeg -outfile $CACHEDIR/${INFILE}_imgs/${INFILE}.img.$IMAGEID.${iafilepagenum}.jpg $CACHEDIR/$INFILE/images/KDUCONVERT.ppm > /dev/null 2>&1\n";
	} else {
	    #otherwise revert to ImageMagick for standard JPG pagescans...
	    if (!exists($UNPACKEDPAGE{$rawfilepagenum})) {
	        if ($IMAGESTAT == 1) {$CMDSBUF_UNPACK .= "unzip -q -j -d $CACHEDIR/$INFILE/images/ $CACHEDIR/$INFILE/images.zip $imageinternalurl/${IMAGEINFILE}_${rawfilepagenum}.$EXT\n";}
		elsif ($IMAGESTAT == 2) {$CMDSBUF_UNPACK .= "wget -q --no-check-certificate \"http://archive.org/download/$INFILE/$imageurl/$imageinternalurl/${IMAGEINFILE}_${rawfilepagenum}.$EXT\" -O $CACHEDIR/$INFILE/images/${IMAGEINFILE}_${rawfilepagenum}.$EXT\n";}
	        $UNPACKEDPAGE{$rawfilepagenum} = 1;
	    }
	    $CMDSBUF_PROCESS .=  "convert -limit thread 1 -crop ${width}x${height}+$l+$t $CACHEDIR/$INFILE/images/${IMAGEINFILE}_${rawfilepagenum}.$EXT $CACHEDIR/${INFILE}_imgs/${INFILE}.img.$IMAGEID.${iafilepagenum}.jpg > /dev/null 2>&1\n";
	}
	$IMAGEID++;
    }
}
close(OUT);
undef($BUF);
#############################
#first write all of the unpacking commands...
print CMDS $CMDSBUF_UNPACK;
#and now all of the processing commands...
print CMDS $CMDSBUF_PROCESS;
#############################################################################################
#and finally ZIP up the final output results...
#print "Zipping...\n";
print CMDS "cd $CACHEDIR/\n";
print CMDS "zip -q -r -0 ${INFILE}_imgs.zip ${INFILE}_imgs/\n";
print CMDS "cd ..\n";
#and then clean up...
print CMDS "mv $CACHEDIR/${INFILE}_imgs.zip $dirname/ZIPCACHE/${INFILE}_imgs.zip\n";
print CMDS "rm -rf $CACHEDIR/$INFILE/\n";
print CMDS "rm -rf $CACHEDIR/${INFILE}_imgs/\n";
#############################################################################################

close(CMDS);
system("chmod 755 $CACHEDIR/${INFILE}/cmds.sh");

#run and done!
system("$CACHEDIR/${INFILE}/cmds.sh&");
exit;




