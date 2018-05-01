<!DOCTYPE html>
<!--[if !IE]><!-->
<html lang="$ContentLocale">
<!--<![endif]-->
<!--[if IE 6 ]><html lang="$ContentLocale" class="ie ie6"><![endif]-->
<!--[if IE 7 ]><html lang="$ContentLocale" class="ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="$ContentLocale" class="ie ie8"><![endif]-->
<head>
	<% base_tag %>
	<title><% if $MetaTitle %>$MetaTitle<% else %>$Title<% end_if %> &raquo; $SiteConfig.Title</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	$MetaTags(false)
	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<%-- production --%>
	<% require themedCSS('devcreative/fileshare:client/dist/styles/style') %>
	<%-- dev --%>
	<%-- <link rel="stylesheet" type="text/css" href="http://localhost:8099/styles/style.css" /> --%>


	<link rel="shortcut icon" href="themes/simple/images/favicon.ico" />
</head>
<body class="$ClassName<% if not $Menu(2) %> no-sidebar<% end_if %>" <% if $i18nScriptDirection %>dir="$i18nScriptDirection"<% end_if %>>


		$Layout





<div class="debug a"></div>
<div class="debug b"></div>
<div class="debug c"></div>

<div class="viewport-test device-xs d-xs-block d-sm-none"></div>
<div class="viewport-test device-sm d-none d-sm-block d-md-none"></div>
<div class="viewport-test device-md d-none d-md-block d-lg-none"></div>
<div class="viewport-test device-lg d-none d-lg-block d-xl-none"></div>
<div class="viewport-test device-xl d-none d-xl-block"></div>

<%-- <% require javascript('//code.jquery.com/jquery-1.7.2.min.js') %> --%>
<%-- production --%>
<% require themedJavascript('devcreative/fileshare:client/dist/bundle.js') %>
<%-- dev --%>
<%-- <script type="application/javascript" src="http://localhost:8097/bundle.js"></script> --%>
</body>
</html>
