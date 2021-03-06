/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2016 SAP SE or an SAP affiliate company.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of SAP
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with SAP.
 */
ACC.forgottenpassword = {

	_autoload: [
		"bindLink",
		"bindClose"
	],

	bindLink: function(){
		$(document).on("click",".js-password-forgotten",function(e){
			e.preventDefault();
			cboxOptions = {
            		width: '95%',
            		maxWidth: '640px',
            	}
			
			ACC.colorbox.open(
				$(this).data("cboxTitle"),
				{
					href: $(this).attr("href"),
	                width: window.innerWidth > parseInt(cboxOptions.maxWidth) ? cboxOptions.maxWidth : cboxOptions.width,
					fixed: true,
					onOpen: function()
					{
						$('#validEmail').remove();
					},
					onComplete: function(){
						$('form#forgottenPwdForm').ajaxForm({
							success: function(data)
							{
								if ($(data).closest('#validEmail').length)
								{
									
									if ($('#validEmail').length === 0)
									{
										$("#cboxLoadedContent .forgotten-password").replaceWith(data);
										ACC.colorbox.resize();
									}
								}
								else
								{
									$("#forgottenPwdForm .control-group").replaceWith($(data).find('.control-group'));
									ACC.colorbox.resize();
								}
							}
						});
					}
				}
			);
		});
	},
	bindClose: function(){
		$(document).on("click",".js-close-forgotten-password",function(e){
			e.preventDefault();
			ACC.colorbox.close();
		});
	}


};