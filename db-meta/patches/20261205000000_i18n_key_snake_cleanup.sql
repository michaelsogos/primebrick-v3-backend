-- i18n key snake_case cleanup — cross-schema atomic patch
-- renames + moves + config.* convergence (B) + CHECK constraints
-- generated from live DB census; single tx

-- tx:
-- === public.translations renames ===
UPDATE public.translations SET "key" = 'app.ai_chat.aria' WHERE "key" = 'app.aiChat.aria';
UPDATE public.translations SET "key" = 'app.ai_chat.conversations' WHERE "key" = 'app.aiChat.conversations';
UPDATE public.translations SET "key" = 'app.ai_chat.empty' WHERE "key" = 'app.aiChat.empty';
UPDATE public.translations SET "key" = 'app.ai_chat.error' WHERE "key" = 'app.aiChat.error';
UPDATE public.translations SET "key" = 'app.ai_chat.loading' WHERE "key" = 'app.aiChat.loading';
UPDATE public.translations SET "key" = 'app.ai_chat.navigate_confirm' WHERE "key" = 'app.aiChat.navigateConfirm';
UPDATE public.translations SET "key" = 'app.ai_chat.new_conversation' WHERE "key" = 'app.aiChat.newConversation';
UPDATE public.translations SET "key" = 'app.ai_chat.no' WHERE "key" = 'app.aiChat.no';
UPDATE public.translations SET "key" = 'app.ai_chat.placeholder' WHERE "key" = 'app.aiChat.placeholder';
UPDATE public.translations SET "key" = 'app.ai_chat.rate_limited' WHERE "key" = 'app.aiChat.rateLimited';
UPDATE public.translations SET "key" = 'app.ai_chat.send' WHERE "key" = 'app.aiChat.send';
UPDATE public.translations SET "key" = 'app.ai_chat.stop' WHERE "key" = 'app.aiChat.stop';
UPDATE public.translations SET "key" = 'app.ai_chat.title' WHERE "key" = 'app.aiChat.title';
UPDATE public.translations SET "key" = 'app.ai_chat.tool_call' WHERE "key" = 'app.aiChat.toolCall';
UPDATE public.translations SET "key" = 'app.ai_chat.tool_call_confirm' WHERE "key" = 'app.aiChat.toolCallConfirm';
UPDATE public.translations SET "key" = 'app.ai_chat.welcome' WHERE "key" = 'app.aiChat.welcome';
UPDATE public.translations SET "key" = 'app.ai_chat.yes' WHERE "key" = 'app.aiChat.yes';
UPDATE public.translations SET "key" = 'app.ai_guide.aria' WHERE "key" = 'app.aiGuide.aria';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.back_to_methods' WHERE "key" = 'app.auth.authMethodEnforcer.backToMethods';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.benefit_convenience_mfa' WHERE "key" = 'app.auth.authMethodEnforcer.benefitConvenienceMfa';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.benefit_convenience_passkey' WHERE "key" = 'app.auth.authMethodEnforcer.benefitConveniencePasskey';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.benefit_security' WHERE "key" = 'app.auth.authMethodEnforcer.benefitSecurity';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.description' WHERE "key" = 'app.auth.authMethodEnforcer.description';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.dismiss_button' WHERE "key" = 'app.auth.authMethodEnforcer.dismissButton';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.dont_ask_again' WHERE "key" = 'app.auth.authMethodEnforcer.dontAskAgain';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.enroll_mfa_button' WHERE "key" = 'app.auth.authMethodEnforcer.enrollMfaButton';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.enroll_passkey_button' WHERE "key" = 'app.auth.authMethodEnforcer.enrollPasskeyButton';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.enrolling' WHERE "key" = 'app.auth.authMethodEnforcer.enrolling';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.method_mfa' WHERE "key" = 'app.auth.authMethodEnforcer.methodMfa';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.method_mfa_desc' WHERE "key" = 'app.auth.authMethodEnforcer.methodMfaDesc';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.method_passkey' WHERE "key" = 'app.auth.authMethodEnforcer.methodPasskey';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.method_passkey_desc' WHERE "key" = 'app.auth.authMethodEnforcer.methodPasskeyDesc';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.title' WHERE "key" = 'app.auth.authMethodEnforcer.title';
UPDATE public.translations SET "key" = 'app.auth.auth_method_enforcer.warning_mfa' WHERE "key" = 'app.auth.authMethodEnforcer.warningMfa';
UPDATE public.translations SET "key" = 'app.auth.login.account_locked' WHERE "key" = 'app.auth.login.accountLocked';
UPDATE public.translations SET "key" = 'app.auth.login.button_loading' WHERE "key" = 'app.auth.login.buttonLoading';
UPDATE public.translations SET "key" = 'app.auth.login.invalid_credentials' WHERE "key" = 'app.auth.login.invalidCredentials';
UPDATE public.translations SET "key" = 'app.auth.login.mfa.challenge_expired' WHERE "key" = 'app.auth.login.mfa.challengeExpired';
UPDATE public.translations SET "key" = 'app.auth.login.mfa.code_required' WHERE "key" = 'app.auth.login.mfa.codeRequired';
UPDATE public.translations SET "key" = 'app.auth.login.mfa.connection_error' WHERE "key" = 'app.auth.login.mfa.connectionError';
UPDATE public.translations SET "key" = 'app.auth.login.mfa.factor_label' WHERE "key" = 'app.auth.login.mfa.factorLabel';
UPDATE public.translations SET "key" = 'app.auth.login.mfa.invalid_code' WHERE "key" = 'app.auth.login.mfa.invalidCode';
UPDATE public.translations SET "key" = 'app.auth.login.passkey.credential_not_found' WHERE "key" = 'app.auth.login.passkey.credentialNotFound';
UPDATE public.translations SET "key" = 'app.auth.login.passkey.session_expired' WHERE "key" = 'app.auth.login.passkey.sessionExpired';
UPDATE public.translations SET "key" = 'app.auth.login.password_placeholder' WHERE "key" = 'app.auth.login.passwordPlaceholder';
UPDATE public.translations SET "key" = 'app.auth.login.user_no_permission' WHERE "key" = 'app.auth.login.userNoPermission';
UPDATE public.translations SET "key" = 'app.auth.login.username_placeholder' WHERE "key" = 'app.auth.login.usernamePlaceholder';
UPDATE public.translations SET "key" = 'app.auth.mfa.code_required' WHERE "key" = 'app.auth.mfa.codeRequired';
UPDATE public.translations SET "key" = 'app.auth.mfa.connection_error' WHERE "key" = 'app.auth.mfa.connectionError';
UPDATE public.translations SET "key" = 'app.auth.mfa.default_label' WHERE "key" = 'app.auth.mfa.defaultLabel';
UPDATE public.translations SET "key" = 'app.auth.mfa.delete_dialog_description' WHERE "key" = 'app.auth.mfa.deleteDialogDescription';
UPDATE public.translations SET "key" = 'app.auth.mfa.delete_dialog_title' WHERE "key" = 'app.auth.mfa.deleteDialogTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa.delete_error' WHERE "key" = 'app.auth.mfa.deleteError';
UPDATE public.translations SET "key" = 'app.auth.mfa.delete_success' WHERE "key" = 'app.auth.mfa.deleteSuccess';
UPDATE public.translations SET "key" = 'app.auth.mfa.disabled_hint' WHERE "key" = 'app.auth.mfa.disabledHint';
UPDATE public.translations SET "key" = 'app.auth.mfa.disabled_title' WHERE "key" = 'app.auth.mfa.disabledTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa.empty_hint' WHERE "key" = 'app.auth.mfa.emptyHint';
UPDATE public.translations SET "key" = 'app.auth.mfa.empty_title' WHERE "key" = 'app.auth.mfa.emptyTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa.enroll_another' WHERE "key" = 'app.auth.mfa.enrollAnother';
UPDATE public.translations SET "key" = 'app.auth.mfa.enroll_button' WHERE "key" = 'app.auth.mfa.enrollButton';
UPDATE public.translations SET "key" = 'app.auth.mfa.enroll_dialog_title' WHERE "key" = 'app.auth.mfa.enrollDialogTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa.enroll_step_qr' WHERE "key" = 'app.auth.mfa.enrollStepQr';
UPDATE public.translations SET "key" = 'app.auth.mfa.enroll_step_verify' WHERE "key" = 'app.auth.mfa.enrollStepVerify';
UPDATE public.translations SET "key" = 'app.auth.mfa.enrollment_error' WHERE "key" = 'app.auth.mfa.enrollmentError';
UPDATE public.translations SET "key" = 'app.auth.mfa.enrollment_success' WHERE "key" = 'app.auth.mfa.enrollmentSuccess';
UPDATE public.translations SET "key" = 'app.auth.mfa.factor_type' WHERE "key" = 'app.auth.mfa.factorType';
UPDATE public.translations SET "key" = 'app.auth.mfa.invalid_code' WHERE "key" = 'app.auth.mfa.invalidCode';
UPDATE public.translations SET "key" = 'app.auth.mfa.label_placeholder' WHERE "key" = 'app.auth.mfa.labelPlaceholder';
UPDATE public.translations SET "key" = 'app.auth.mfa.last_used' WHERE "key" = 'app.auth.mfa.lastUsed';
UPDATE public.translations SET "key" = 'app.auth.mfa.loading_hint' WHERE "key" = 'app.auth.mfa.loadingHint';
UPDATE public.translations SET "key" = 'app.auth.mfa.loading_title' WHERE "key" = 'app.auth.mfa.loadingTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa.manual_entry' WHERE "key" = 'app.auth.mfa.manualEntry';
UPDATE public.translations SET "key" = 'app.auth.mfa.recovery_codes' WHERE "key" = 'app.auth.mfa.recoveryCodes';
UPDATE public.translations SET "key" = 'app.auth.mfa.recovery_codes_warning' WHERE "key" = 'app.auth.mfa.recoveryCodesWarning';
UPDATE public.translations SET "key" = 'app.auth.mfa.verify_and_enable' WHERE "key" = 'app.auth.mfa.verifyAndEnable';
UPDATE public.translations SET "key" = 'app.auth.mfa.verify_code' WHERE "key" = 'app.auth.mfa.verifyCode';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.select_factor' WHERE "key" = 'app.auth.mfaStepUp.selectFactor';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.step_up_action' WHERE "key" = 'app.auth.mfaStepUp.stepUpAction';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.step_up_authorized' WHERE "key" = 'app.auth.mfaStepUp.stepUpAuthorized';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.step_up_description' WHERE "key" = 'app.auth.mfaStepUp.stepUpDescription';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.step_up_initiate_error' WHERE "key" = 'app.auth.mfaStepUp.stepUpInitiateError';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.step_up_title' WHERE "key" = 'app.auth.mfaStepUp.stepUpTitle';
UPDATE public.translations SET "key" = 'app.auth.mfa_step_up.verify_and_authorize' WHERE "key" = 'app.auth.mfaStepUp.verifyAndAuthorize';
UPDATE public.translations SET "key" = 'app.auth.passkeys.already_enrolled' WHERE "key" = 'app.auth.passkeys.alreadyEnrolled';
UPDATE public.translations SET "key" = 'app.auth.passkeys.delete_error' WHERE "key" = 'app.auth.passkeys.deleteError';
UPDATE public.translations SET "key" = 'app.auth.passkeys.empty_hint' WHERE "key" = 'app.auth.passkeys.emptyHint';
UPDATE public.translations SET "key" = 'app.auth.passkeys.empty_title' WHERE "key" = 'app.auth.passkeys.emptyTitle';
UPDATE public.translations SET "key" = 'app.auth.passkeys.enrolled_on' WHERE "key" = 'app.auth.passkeys.enrolledOn';
UPDATE public.translations SET "key" = 'app.auth.passkeys.enrollment_error' WHERE "key" = 'app.auth.passkeys.enrollmentError';
UPDATE public.translations SET "key" = 'app.auth.passkeys.enrollment_success' WHERE "key" = 'app.auth.passkeys.enrollmentSuccess';
UPDATE public.translations SET "key" = 'app.auth.passkeys.last_used' WHERE "key" = 'app.auth.passkeys.lastUsed';
UPDATE public.translations SET "key" = 'app.auth.passkeys.loading_hint' WHERE "key" = 'app.auth.passkeys.loadingHint';
UPDATE public.translations SET "key" = 'app.auth.passkeys.loading_title' WHERE "key" = 'app.auth.passkeys.loadingTitle';
UPDATE public.translations SET "key" = 'app.auth.passkeys.never_used' WHERE "key" = 'app.auth.passkeys.neverUsed';
UPDATE public.translations SET "key" = 'app.auth.passkeys.not_supported' WHERE "key" = 'app.auth.passkeys.notSupported';
UPDATE public.translations SET "key" = 'app.auth.passkeys.unknown_device' WHERE "key" = 'app.auth.passkeys.unknownDevice';
UPDATE public.translations SET "key" = 'app.auth.passkeys.unknown_passkey' WHERE "key" = 'app.auth.passkeys.unknownPasskey';
UPDATE public.translations SET "key" = 'app.auth.roles.not_valid_role' WHERE "key" = 'app.auth.roles.notValidRole';
UPDATE public.translations SET "key" = 'app.auth.roles.system_administrator' WHERE "key" = 'app.auth.roles.systemAdministrator';
UPDATE public.translations SET "key" = 'app.auth.session_expired.description' WHERE "key" = 'app.auth.sessionExpired.description';
UPDATE public.translations SET "key" = 'app.auth.session_expired.failed_attempt' WHERE "key" = 'app.auth.sessionExpired.failedAttempt';
UPDATE public.translations SET "key" = 'app.auth.session_expired.go_to_login' WHERE "key" = 'app.auth.sessionExpired.goToLogin';
UPDATE public.translations SET "key" = 'app.auth.session_expired.title' WHERE "key" = 'app.auth.sessionExpired.title';
UPDATE public.translations SET "key" = 'app.auth.welcome.complete.login_button' WHERE "key" = 'app.auth.welcome.complete.loginButton';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.back_to_login' WHERE "key" = 'app.auth.welcome.error.backToLogin';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.complete_failed' WHERE "key" = 'app.auth.welcome.error.completeFailed';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.invalid_token' WHERE "key" = 'app.auth.welcome.error.invalidToken';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.network_error' WHERE "key" = 'app.auth.welcome.error.networkError';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.no_token' WHERE "key" = 'app.auth.welcome.error.noToken';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.otp_invalid' WHERE "key" = 'app.auth.welcome.error.otpInvalid';
UPDATE public.translations SET "key" = 'app.auth.welcome.error.otp_send_failed' WHERE "key" = 'app.auth.welcome.error.otpSendFailed';
UPDATE public.translations SET "key" = 'app.auth.welcome.otp.code_label' WHERE "key" = 'app.auth.welcome.otp.codeLabel';
UPDATE public.translations SET "key" = 'app.auth.welcome.otp.resend_button' WHERE "key" = 'app.auth.welcome.otp.resendButton';
UPDATE public.translations SET "key" = 'app.auth.welcome.otp.resend_in' WHERE "key" = 'app.auth.welcome.otp.resendIn';
UPDATE public.translations SET "key" = 'app.auth.welcome.otp.verify_button' WHERE "key" = 'app.auth.welcome.otp.verifyButton';
UPDATE public.translations SET "key" = 'app.auth.welcome.passkey.description_required' WHERE "key" = 'app.auth.welcome.passkey.descriptionRequired';
UPDATE public.translations SET "key" = 'app.auth.welcome.passkey.enroll_button' WHERE "key" = 'app.auth.welcome.passkey.enrollButton';
UPDATE public.translations SET "key" = 'app.auth.welcome.passkey.title_required' WHERE "key" = 'app.auth.welcome.passkey.titleRequired';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.complete_button' WHERE "key" = 'app.auth.welcome.setPassword.completeButton';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.completing' WHERE "key" = 'app.auth.welcome.setPassword.completing';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.confirm_password_label' WHERE "key" = 'app.auth.welcome.setPassword.confirmPasswordLabel';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.confirm_password_placeholder' WHERE "key" = 'app.auth.welcome.setPassword.confirmPasswordPlaceholder';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.description' WHERE "key" = 'app.auth.welcome.setPassword.description';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.new_password_label' WHERE "key" = 'app.auth.welcome.setPassword.newPasswordLabel';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.new_password_placeholder' WHERE "key" = 'app.auth.welcome.setPassword.newPasswordPlaceholder';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.passwords_do_not_match' WHERE "key" = 'app.auth.welcome.setPassword.passwordsDoNotMatch';
UPDATE public.translations SET "key" = 'app.auth.welcome.set_password.title' WHERE "key" = 'app.auth.welcome.setPassword.title';
UPDATE public.translations SET "key" = 'app.command_palette.description' WHERE "key" = 'app.commandPalette.description';
UPDATE public.translations SET "key" = 'app.command_palette.empty' WHERE "key" = 'app.commandPalette.empty';
UPDATE public.translations SET "key" = 'app.command_palette.group_settings' WHERE "key" = 'app.commandPalette.groupSettings';
UPDATE public.translations SET "key" = 'app.command_palette.group_suggestions' WHERE "key" = 'app.commandPalette.groupSuggestions';
UPDATE public.translations SET "key" = 'app.command_palette.input_placeholder' WHERE "key" = 'app.commandPalette.inputPlaceholder';
UPDATE public.translations SET "key" = 'app.command_palette.item_billing' WHERE "key" = 'app.commandPalette.itemBilling';
UPDATE public.translations SET "key" = 'app.command_palette.item_calculator' WHERE "key" = 'app.commandPalette.itemCalculator';
UPDATE public.translations SET "key" = 'app.command_palette.item_calendar' WHERE "key" = 'app.commandPalette.itemCalendar';
UPDATE public.translations SET "key" = 'app.command_palette.item_profile' WHERE "key" = 'app.commandPalette.itemProfile';
UPDATE public.translations SET "key" = 'app.command_palette.item_search_emoji' WHERE "key" = 'app.commandPalette.itemSearchEmoji';
UPDATE public.translations SET "key" = 'app.command_palette.item_settings' WHERE "key" = 'app.commandPalette.itemSettings';
UPDATE public.translations SET "key" = 'app.command_palette.title' WHERE "key" = 'app.commandPalette.title';
UPDATE public.translations SET "key" = 'app.common.bulk_revert' WHERE "key" = 'app.common.bulkRevert';
UPDATE public.translations SET "key" = 'app.common.bulk_scope_all_desc' WHERE "key" = 'app.common.bulkScopeAllDesc';
UPDATE public.translations SET "key" = 'app.common.bulk_scope_all_title' WHERE "key" = 'app.common.bulkScopeAllTitle';
UPDATE public.translations SET "key" = 'app.common.bulk_scope_selected_desc' WHERE "key" = 'app.common.bulkScopeSelectedDesc';
UPDATE public.translations SET "key" = 'app.common.bulk_scope_selected_title' WHERE "key" = 'app.common.bulkScopeSelectedTitle';
UPDATE public.translations SET "key" = 'app.common.changes_pending' WHERE "key" = 'app.common.changesPending';
UPDATE public.translations SET "key" = 'app.common.clear_all' WHERE "key" = 'app.common.clearAll';
UPDATE public.translations SET "key" = 'app.common.clear_selection' WHERE "key" = 'app.common.clearSelection';
UPDATE public.translations SET "key" = 'app.common.copy_html' WHERE "key" = 'app.common.copyHtml';
UPDATE public.translations SET "key" = 'app.common.db_unavailable' WHERE "key" = 'app.common.dbUnavailable';
UPDATE public.translations SET "key" = 'app.common.delete_confirm' WHERE "key" = 'app.common.deleteConfirm';
UPDATE public.translations SET "key" = 'app.common.delete_confirm_title' WHERE "key" = 'app.common.deleteConfirmTitle';
UPDATE public.translations SET "key" = 'app.common.delete_entities_confirm' WHERE "key" = 'app.common.deleteEntitiesConfirm';
UPDATE public.translations SET "key" = 'app.common.delete_entities_title' WHERE "key" = 'app.common.deleteEntitiesTitle';
UPDATE public.translations SET "key" = 'app.common.delete_entity_confirm' WHERE "key" = 'app.common.deleteEntityConfirm';
UPDATE public.translations SET "key" = 'app.common.delete_entity_title' WHERE "key" = 'app.common.deleteEntityTitle';
UPDATE public.translations SET "key" = 'app.common.delete_failed' WHERE "key" = 'app.common.deleteFailed';
UPDATE public.translations SET "key" = 'app.common.delete_success' WHERE "key" = 'app.common.deleteSuccess';
UPDATE public.translations SET "key" = 'app.common.deleted_record' WHERE "key" = 'app.common.deletedRecord';
UPDATE public.translations SET "key" = 'app.common.deselect_all' WHERE "key" = 'app.common.deselectAll';
UPDATE public.translations SET "key" = 'app.common.draft_restored' WHERE "key" = 'app.common.draftRestored';
UPDATE public.translations SET "key" = 'app.common.draft_restored_title' WHERE "key" = 'app.common.draftRestoredTitle';
UPDATE public.translations SET "key" = 'app.common.duplicate_confirm' WHERE "key" = 'app.common.duplicateConfirm';
UPDATE public.translations SET "key" = 'app.common.duplicate_confirm_single' WHERE "key" = 'app.common.duplicateConfirmSingle';
UPDATE public.translations SET "key" = 'app.common.duplicate_confirm_title' WHERE "key" = 'app.common.duplicateConfirmTitle';
UPDATE public.translations SET "key" = 'app.common.enter_value' WHERE "key" = 'app.common.enterValue';
UPDATE public.translations SET "key" = 'app.common.errors.not_implemented.detail' WHERE "key" = 'app.common.errors.notImplemented.detail';
UPDATE public.translations SET "key" = 'app.common.errors.not_implemented.title' WHERE "key" = 'app.common.errors.notImplemented.title';
UPDATE public.translations SET "key" = 'app.common.errors.scope.bulk_delete_api' WHERE "key" = 'app.common.errors.scope.bulkDeleteApi';
UPDATE public.translations SET "key" = 'app.common.errors.scope.customer_list_api' WHERE "key" = 'app.common.errors.scope.customerListApi';
UPDATE public.translations SET "key" = 'app.common.errors.scope.customers_list' WHERE "key" = 'app.common.errors.scope.customersList';
UPDATE public.translations SET "key" = 'app.common.errors.scope.customers_page_init' WHERE "key" = 'app.common.errors.scope.customersPageInit';
UPDATE public.translations SET "key" = 'app.common.errors.scope.dict_list' WHERE "key" = 'app.common.errors.scope.dictList';
UPDATE public.translations SET "key" = 'app.common.errors.scope.duplicate_action' WHERE "key" = 'app.common.errors.scope.duplicateAction';
UPDATE public.translations SET "key" = 'app.common.errors.scope.duplicate_api' WHERE "key" = 'app.common.errors.scope.duplicateApi';
UPDATE public.translations SET "key" = 'app.common.errors.scope.emailsender_providers_list' WHERE "key" = 'app.common.errors.scope.emailsenderProvidersList';
UPDATE public.translations SET "key" = 'app.common.errors.scope.emailsender_providers_page_init' WHERE "key" = 'app.common.errors.scope.emailsenderProvidersPageInit';
UPDATE public.translations SET "key" = 'app.common.errors.scope.emailsender_templates_list' WHERE "key" = 'app.common.errors.scope.emailsenderTemplatesList';
UPDATE public.translations SET "key" = 'app.common.errors.scope.emailsender_templates_page_init' WHERE "key" = 'app.common.errors.scope.emailsenderTemplatesPageInit';
UPDATE public.translations SET "key" = 'app.common.export_confirm' WHERE "key" = 'app.common.exportConfirm';
UPDATE public.translations SET "key" = 'app.common.export_confirm_title' WHERE "key" = 'app.common.exportConfirmTitle';
UPDATE public.translations SET "key" = 'app.common.export_csv' WHERE "key" = 'app.common.exportCsv';
UPDATE public.translations SET "key" = 'app.common.export_excel' WHERE "key" = 'app.common.exportExcel';
UPDATE public.translations SET "key" = 'app.common.export_html_confirm' WHERE "key" = 'app.common.exportHtmlConfirm';
UPDATE public.translations SET "key" = 'app.common.export_html_confirm_title' WHERE "key" = 'app.common.exportHtmlConfirmTitle';
UPDATE public.translations SET "key" = 'app.common.hide_disabled_options' WHERE "key" = 'app.common.hideDisabledOptions';
UPDATE public.translations SET "key" = 'app.common.html_preview_title' WHERE "key" = 'app.common.htmlPreviewTitle';
UPDATE public.translations SET "key" = 'app.common.impact.critical_error' WHERE "key" = 'app.common.impact.criticalError';
UPDATE public.translations SET "key" = 'app.common.last_updated_by_mid' WHERE "key" = 'app.common.lastUpdatedByMid';
UPDATE public.translations SET "key" = 'app.common.last_updated_prefix' WHERE "key" = 'app.common.lastUpdatedPrefix';
UPDATE public.translations SET "key" = 'app.common.load_error' WHERE "key" = 'app.common.loadError';
UPDATE public.translations SET "key" = 'app.common.load_failed' WHERE "key" = 'app.common.loadFailed';
UPDATE public.translations SET "key" = 'app.common.no_changes' WHERE "key" = 'app.common.noChanges';
UPDATE public.translations SET "key" = 'app.common.no_results' WHERE "key" = 'app.common.noResults';
UPDATE public.translations SET "key" = 'app.common.optional_tooltip_text' WHERE "key" = 'app.common.optionalTooltipText';
UPDATE public.translations SET "key" = 'app.common.optional_tooltip_title' WHERE "key" = 'app.common.optionalTooltipTitle';
UPDATE public.translations SET "key" = 'app.common.restore_confirm' WHERE "key" = 'app.common.restoreConfirm';
UPDATE public.translations SET "key" = 'app.common.restore_confirm_title' WHERE "key" = 'app.common.restoreConfirmTitle';
UPDATE public.translations SET "key" = 'app.common.restore_entities_confirm' WHERE "key" = 'app.common.restoreEntitiesConfirm';
UPDATE public.translations SET "key" = 'app.common.restore_entities_title' WHERE "key" = 'app.common.restoreEntitiesTitle';
UPDATE public.translations SET "key" = 'app.common.restore_entity_confirm' WHERE "key" = 'app.common.restoreEntityConfirm';
UPDATE public.translations SET "key" = 'app.common.restore_entity_title' WHERE "key" = 'app.common.restoreEntityTitle';
UPDATE public.translations SET "key" = 'app.common.revert_changes' WHERE "key" = 'app.common.revertChanges';
UPDATE public.translations SET "key" = 'app.common.row_actions' WHERE "key" = 'app.common.rowActions';
UPDATE public.translations SET "key" = 'app.common.save_changes' WHERE "key" = 'app.common.saveChanges';
UPDATE public.translations SET "key" = 'app.common.save_failed' WHERE "key" = 'app.common.saveFailed';
UPDATE public.translations SET "key" = 'app.common.save_success' WHERE "key" = 'app.common.saveSuccess';
UPDATE public.translations SET "key" = 'app.common.scroll_to_bottom' WHERE "key" = 'app.common.scrollToBottom';
UPDATE public.translations SET "key" = 'app.common.select_all' WHERE "key" = 'app.common.selectAll';
UPDATE public.translations SET "key" = 'app.common.select_date' WHERE "key" = 'app.common.selectDate';
UPDATE public.translations SET "key" = 'app.common.select_row' WHERE "key" = 'app.common.selectRow';
UPDATE public.translations SET "key" = 'app.common.select_value' WHERE "key" = 'app.common.selectValue';
UPDATE public.translations SET "key" = 'app.common.show_disabled_options' WHERE "key" = 'app.common.showDisabledOptions';
UPDATE public.translations SET "key" = 'app.common.toggle_sidebar' WHERE "key" = 'app.common.toggleSidebar';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.error' WHERE "key" = 'app.common.tooltipTitle.error';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.hint' WHERE "key" = 'app.common.tooltipTitle.hint';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.information' WHERE "key" = 'app.common.tooltipTitle.information';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.question' WHERE "key" = 'app.common.tooltipTitle.question';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.success' WHERE "key" = 'app.common.tooltipTitle.success';
UPDATE public.translations SET "key" = 'app.common.tooltip_title.warning' WHERE "key" = 'app.common.tooltipTitle.warning';
UPDATE public.translations SET "key" = 'app.common.translations.accept_all' WHERE "key" = 'app.common.translations.acceptAll';
UPDATE public.translations SET "key" = 'app.common.translations.ai_failed' WHERE "key" = 'app.common.translations.aiFailed';
UPDATE public.translations SET "key" = 'app.common.translations.ai_skipped' WHERE "key" = 'app.common.translations.aiSkipped';
UPDATE public.translations SET "key" = 'app.common.translations.ai_unavailable' WHERE "key" = 'app.common.translations.aiUnavailable';
UPDATE public.translations SET "key" = 'app.common.translations.en_required' WHERE "key" = 'app.common.translations.enRequired';
UPDATE public.translations SET "key" = 'app.common.translations.flush_failed' WHERE "key" = 'app.common.translations.flushFailed';
UPDATE public.translations SET "key" = 'app.common.translations.generate_all' WHERE "key" = 'app.common.translations.generateAll';
UPDATE public.translations SET "key" = 'app.common.translations.results_title' WHERE "key" = 'app.common.translations.resultsTitle';
UPDATE public.translations SET "key" = 'app.common.unsaved_changes' WHERE "key" = 'app.common.unsavedChanges';
UPDATE public.translations SET "key" = 'app.common.validation.email_required' WHERE "key" = 'app.common.validation.emailRequired';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_bigint' WHERE "key" = 'app.common.validation.invalidBigint';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_bigint_unsigned' WHERE "key" = 'app.common.validation.invalidBigintUnsigned';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_boolean' WHERE "key" = 'app.common.validation.invalidBoolean';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_email' WHERE "key" = 'app.common.validation.invalidEmail';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_format' WHERE "key" = 'app.common.validation.invalidFormat';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_integer' WHERE "key" = 'app.common.validation.invalidInteger';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_json' WHERE "key" = 'app.common.validation.invalidJson';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_number' WHERE "key" = 'app.common.validation.invalidNumber';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_number_unsigned' WHERE "key" = 'app.common.validation.invalidNumberUnsigned';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_phone' WHERE "key" = 'app.common.validation.invalidPhone';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_regex_pattern' WHERE "key" = 'app.common.validation.invalidRegexPattern';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_url' WHERE "key" = 'app.common.validation.invalidUrl';
UPDATE public.translations SET "key" = 'app.common.validation.invalid_url_protocol' WHERE "key" = 'app.common.validation.invalidUrlProtocol';
UPDATE public.translations SET "key" = 'app.common.validation.name_taken' WHERE "key" = 'app.common.validation.nameTaken';
UPDATE public.translations SET "key" = 'app.common.validation.org_required' WHERE "key" = 'app.common.validation.orgRequired';
UPDATE public.translations SET "key" = 'app.common.validation.password_letter' WHERE "key" = 'app.common.validation.passwordLetter';
UPDATE public.translations SET "key" = 'app.common.validation.password_lowercase' WHERE "key" = 'app.common.validation.passwordLowercase';
UPDATE public.translations SET "key" = 'app.common.validation.password_min_length' WHERE "key" = 'app.common.validation.passwordMinLength';
UPDATE public.translations SET "key" = 'app.common.validation.password_number' WHERE "key" = 'app.common.validation.passwordNumber';
UPDATE public.translations SET "key" = 'app.common.validation.password_policy_alpha_numeric' WHERE "key" = 'app.common.validation.passwordPolicyAlphaNumeric';
UPDATE public.translations SET "key" = 'app.common.validation.password_policy_letter_and_number' WHERE "key" = 'app.common.validation.passwordPolicyLetterAndNumber';
UPDATE public.translations SET "key" = 'app.common.validation.password_policy_letter_number_special' WHERE "key" = 'app.common.validation.passwordPolicyLetterNumberSpecial';
UPDATE public.translations SET "key" = 'app.common.validation.password_policy_mixed_case_special' WHERE "key" = 'app.common.validation.passwordPolicyMixedCaseSpecial';
UPDATE public.translations SET "key" = 'app.common.validation.password_required' WHERE "key" = 'app.common.validation.passwordRequired';
UPDATE public.translations SET "key" = 'app.common.validation.password_special' WHERE "key" = 'app.common.validation.passwordSpecial';
UPDATE public.translations SET "key" = 'app.common.validation.password_uppercase' WHERE "key" = 'app.common.validation.passwordUppercase';
UPDATE public.translations SET "key" = 'app.common.validation.password_weak' WHERE "key" = 'app.common.validation.passwordWeak';
UPDATE public.translations SET "key" = 'app.common.validation.regex_mismatch' WHERE "key" = 'app.common.validation.regexMismatch';
UPDATE public.translations SET "key" = 'app.common.validation.roles_required' WHERE "key" = 'app.common.validation.rolesRequired';
UPDATE public.translations SET "key" = 'app.common.validation.too_long' WHERE "key" = 'app.common.validation.tooLong';
UPDATE public.translations SET "key" = 'app.common.validation.too_short' WHERE "key" = 'app.common.validation.tooShort';
UPDATE public.translations SET "key" = 'app.common.version_history' WHERE "key" = 'app.common.versionHistory';
UPDATE public.translations SET "key" = 'app.docs.no_results' WHERE "key" = 'app.docs.noResults';
UPDATE public.translations SET "key" = 'app.docs.not_found' WHERE "key" = 'app.docs.notFound';
UPDATE public.translations SET "key" = 'app.docs.on_this_page' WHERE "key" = 'app.docs.onThisPage';
UPDATE public.translations SET "key" = 'app.docs.see_also' WHERE "key" = 'app.docs.seeAlso';
UPDATE public.translations SET "key" = 'app.docs.view_full' WHERE "key" = 'app.docs.viewFull';
UPDATE public.translations SET "key" = 'app.errors.error_details' WHERE "key" = 'app.errors.errorDetails';
UPDATE public.translations SET "key" = 'app.errors.unhandled_error' WHERE "key" = 'app.errors.unhandledError';
UPDATE public.translations SET "key" = 'app.errors.unhandled_error_fallback' WHERE "key" = 'app.errors.unhandledErrorFallback';
UPDATE public.translations SET "key" = 'app.errors.unhandled_rejection' WHERE "key" = 'app.errors.unhandledRejection';
UPDATE public.translations SET "key" = 'app.errors.unhandled_rejection_fallback' WHERE "key" = 'app.errors.unhandledRejectionFallback';
UPDATE public.translations SET "key" = 'app.errors.view_details' WHERE "key" = 'app.errors.viewDetails';
UPDATE public.translations SET "key" = 'app.health.ai_enabled' WHERE "key" = 'app.health.aiEnabled';
UPDATE public.translations SET "key" = 'app.health.ai_llm' WHERE "key" = 'app.health.aiLlm';
UPDATE public.translations SET "key" = 'app.health.backend_version' WHERE "key" = 'app.health.backendVersion';
UPDATE public.translations SET "key" = 'app.health.be_offline' WHERE "key" = 'app.health.beOffline';
UPDATE public.translations SET "key" = 'app.health.be_online' WHERE "key" = 'app.health.beOnline';
UPDATE public.translations SET "key" = 'app.health.browser_version' WHERE "key" = 'app.health.browserVersion';
UPDATE public.translations SET "key" = 'app.health.calendar_system' WHERE "key" = 'app.health.calendarSystem';
UPDATE public.translations SET "key" = 'app.health.client_title' WHERE "key" = 'app.health.clientTitle';
UPDATE public.translations SET "key" = 'app.health.core_modules_title' WHERE "key" = 'app.health.coreModulesTitle';
UPDATE public.translations SET "key" = 'app.health.cpu_threads' WHERE "key" = 'app.health.cpuThreads';
UPDATE public.translations SET "key" = 'app.health.db_offline' WHERE "key" = 'app.health.dbOffline';
UPDATE public.translations SET "key" = 'app.health.gpu_driver' WHERE "key" = 'app.health.gpuDriver';
UPDATE public.translations SET "key" = 'app.health.gpu_rank' WHERE "key" = 'app.health.gpuRank';
UPDATE public.translations SET "key" = 'app.health.hour_cycle' WHERE "key" = 'app.health.hourCycle';
UPDATE public.translations SET "key" = 'app.health.iana_timezone' WHERE "key" = 'app.health.ianaTimezone';
UPDATE public.translations SET "key" = 'app.health.identity_provider' WHERE "key" = 'app.health.identityProvider';
UPDATE public.translations SET "key" = 'app.health.idp_offline' WHERE "key" = 'app.health.idpOffline';
UPDATE public.translations SET "key" = 'app.health.installed_modules_title' WHERE "key" = 'app.health.installedModulesTitle';
UPDATE public.translations SET "key" = 'app.health.microservices_title' WHERE "key" = 'app.health.microservicesTitle';
UPDATE public.translations SET "key" = 'app.health.modules_title' WHERE "key" = 'app.health.modulesTitle';
UPDATE public.translations SET "key" = 'app.health.nats_offline' WHERE "key" = 'app.health.natsOffline';
UPDATE public.translations SET "key" = 'app.health.no_microservices' WHERE "key" = 'app.health.noMicroservices';
UPDATE public.translations SET "key" = 'app.health.numbering_system' WHERE "key" = 'app.health.numberingSystem';
UPDATE public.translations SET "key" = 'app.health.operating_system' WHERE "key" = 'app.health.operatingSystem';
UPDATE public.translations SET "key" = 'app.health.os_arch' WHERE "key" = 'app.health.osArch';
UPDATE public.translations SET "key" = 'app.health.os_version' WHERE "key" = 'app.health.osVersion';
UPDATE public.translations SET "key" = 'app.health.preferred_languages' WHERE "key" = 'app.health.preferredLanguages';
UPDATE public.translations SET "key" = 'app.health.redis_offline' WHERE "key" = 'app.health.redisOffline';
UPDATE public.translations SET "key" = 'app.health.resolved_locale' WHERE "key" = 'app.health.resolvedLocale';
UPDATE public.translations SET "key" = 'app.health.shell_version' WHERE "key" = 'app.health.shellVersion';
UPDATE public.translations SET "key" = 'app.health.status_label' WHERE "key" = 'app.health.statusLabel';
UPDATE public.translations SET "key" = 'app.health.status_tooltip' WHERE "key" = 'app.health.statusTooltip';
UPDATE public.translations SET "key" = 'app.health.system_info_title' WHERE "key" = 'app.health.systemInfoTitle';
UPDATE public.translations SET "key" = 'app.health.system_ram' WHERE "key" = 'app.health.systemRam';
UPDATE public.translations SET "key" = 'app.health.versions_title' WHERE "key" = 'app.health.versionsTitle';
UPDATE public.translations SET "key" = 'app.health.vram_estimate' WHERE "key" = 'app.health.vramEstimate';
UPDATE public.translations SET "key" = 'app.list_failed' WHERE "key" = 'app.listFailed';
UPDATE public.translations SET "key" = 'app.mcp.consent.approve_button' WHERE "key" = 'app.mcp.consent.approveButton';
UPDATE public.translations SET "key" = 'app.mcp.consent.client_name' WHERE "key" = 'app.mcp.consent.clientName';
UPDATE public.translations SET "key" = 'app.mcp.consent.deny_button' WHERE "key" = 'app.mcp.consent.denyButton';
UPDATE public.translations SET "key" = 'app.mcp.consent.invalid_params' WHERE "key" = 'app.mcp.consent.invalidParams';
UPDATE public.translations SET "key" = 'app.mcp.consent.login_first' WHERE "key" = 'app.mcp.consent.loginFirst';
UPDATE public.translations SET "key" = 'app.mcp.consent.login_required' WHERE "key" = 'app.mcp.consent.loginRequired';
UPDATE public.translations SET "key" = 'app.mcp.consent.requested_scopes' WHERE "key" = 'app.mcp.consent.requestedScopes';
UPDATE public.translations SET "key" = 'app.mcp.consent.security_note' WHERE "key" = 'app.mcp.consent.securityNote';
UPDATE public.translations SET "key" = 'app.modules_load_failed' WHERE "key" = 'app.modulesLoadFailed';
UPDATE public.translations SET "key" = 'app.nav.crm_breadcrumb_menu' WHERE "key" = 'app.nav.crmBreadcrumbMenu';
UPDATE public.translations SET "key" = 'app.nav.crm_fallback' WHERE "key" = 'app.nav.crmFallback';
UPDATE public.translations SET "key" = 'app.nav.go_to' WHERE "key" = 'app.nav.goTo';
UPDATE public.translations SET "key" = 'app.nav.root_level' WHERE "key" = 'app.nav.rootLevel';
UPDATE public.translations SET "key" = 'app.org.john_doe' WHERE "key" = 'app.org.johnDoe';
UPDATE public.translations SET "key" = 'app.org.switcher_aria' WHERE "key" = 'app.org.switcherAria';
UPDATE public.translations SET "key" = 'app.rfc_error.preview' WHERE "key" = 'app.rfcError.preview';
UPDATE public.translations SET "key" = 'app.rfc_error.source' WHERE "key" = 'app.rfcError.source';
UPDATE public.translations SET "key" = 'app.server_unreachable' WHERE "key" = 'app.serverUnreachable';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.cancel_load' WHERE "key" = 'app.smart.guide.ai.cancelLoad';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.loading_model' WHERE "key" = 'app.smart.guide.ai.loadingModel';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.loading_vram' WHERE "key" = 'app.smart.guide.ai.loadingVram';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.model_not_configured' WHERE "key" = 'app.smart.guide.ai.modelNotConfigured';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.model_ready' WHERE "key" = 'app.smart.guide.ai.modelReady';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.new_session' WHERE "key" = 'app.smart.guide.ai.newSession';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.no_documentation' WHERE "key" = 'app.smart.guide.ai.noDocumentation';
UPDATE public.translations SET "key" = 'app.smart.guide.ai.webgpu_required' WHERE "key" = 'app.smart.guide.ai.webgpuRequired';
UPDATE public.translations SET "key" = 'app.smart.json.ai.brain_cta' WHERE "key" = 'app.smart.json.ai.brainCta';
UPDATE public.translations SET "key" = 'app.smart.json.ai.cancel_load' WHERE "key" = 'app.smart.json.ai.cancelLoad';
UPDATE public.translations SET "key" = 'app.smart.json.ai.loading_model' WHERE "key" = 'app.smart.json.ai.loadingModel';
UPDATE public.translations SET "key" = 'app.smart.json.ai.loading_vram' WHERE "key" = 'app.smart.json.ai.loadingVram';
UPDATE public.translations SET "key" = 'app.smart.json.ai.model_not_configured' WHERE "key" = 'app.smart.json.ai.modelNotConfigured';
UPDATE public.translations SET "key" = 'app.smart.json.ai.model_ready' WHERE "key" = 'app.smart.json.ai.modelReady';
UPDATE public.translations SET "key" = 'app.smart.json.ai.new_session' WHERE "key" = 'app.smart.json.ai.newSession';
UPDATE public.translations SET "key" = 'app.smart.json.ai.webgpu_required' WHERE "key" = 'app.smart.json.ai.webgpuRequired';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.brain_cta' WHERE "key" = 'app.smart.regex.ai.brainCta';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.cancel_load' WHERE "key" = 'app.smart.regex.ai.cancelLoad';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.choose_option' WHERE "key" = 'app.smart.regex.ai.chooseOption';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.flags_cta' WHERE "key" = 'app.smart.regex.ai.flagsCta';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.here_you_are' WHERE "key" = 'app.smart.regex.ai.hereYouAre';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.here_you_are_with_desc' WHERE "key" = 'app.smart.regex.ai.hereYouAreWithDesc';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.loading_model' WHERE "key" = 'app.smart.regex.ai.loadingModel';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.model_not_configured' WHERE "key" = 'app.smart.regex.ai.modelNotConfigured';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.model_ready' WHERE "key" = 'app.smart.regex.ai.modelReady';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.new_session' WHERE "key" = 'app.smart.regex.ai.newSession';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.use_this' WHERE "key" = 'app.smart.regex.ai.useThis';
UPDATE public.translations SET "key" = 'app.smart.regex.ai.webgpu_required' WHERE "key" = 'app.smart.regex.ai.webgpuRequired';
UPDATE public.translations SET "key" = 'app.smart.regex.flags.global_help' WHERE "key" = 'app.smart.regex.flags.globalHelp';
UPDATE public.translations SET "key" = 'app.smart.regex.flags.ignore_case' WHERE "key" = 'app.smart.regex.flags.ignoreCase';
UPDATE public.translations SET "key" = 'app.smart.regex.flags.ignore_case_help' WHERE "key" = 'app.smart.regex.flags.ignoreCaseHelp';
UPDATE public.translations SET "key" = 'app.smart.regex.flags.multiline_help' WHERE "key" = 'app.smart.regex.flags.multilineHelp';
UPDATE public.translations SET "key" = 'app.user_menu.account_soon' WHERE "key" = 'app.userMenu.accountSoon';
UPDATE public.translations SET "key" = 'app.user_menu.aria' WHERE "key" = 'app.userMenu.aria';
UPDATE public.translations SET "key" = 'app.user_menu.item_account' WHERE "key" = 'app.userMenu.itemAccount';
UPDATE public.translations SET "key" = 'app.user_menu.item_billing' WHERE "key" = 'app.userMenu.itemBilling';
UPDATE public.translations SET "key" = 'app.user_menu.item_notifications' WHERE "key" = 'app.userMenu.itemNotifications';
UPDATE public.translations SET "key" = 'app.user_menu.item_settings' WHERE "key" = 'app.userMenu.itemSettings';
UPDATE public.translations SET "key" = 'app.user_menu.item_sign_out' WHERE "key" = 'app.userMenu.itemSignOut';
UPDATE public.translations SET "key" = 'app.user_menu.item_upgrade' WHERE "key" = 'app.userMenu.itemUpgrade';
UPDATE public.translations SET "key" = 'app.user_menu.profile_label' WHERE "key" = 'app.userMenu.profileLabel';
UPDATE public.translations SET "key" = 'app.user_menu.sign_out_soon' WHERE "key" = 'app.userMenu.signOutSoon';
UPDATE public.translations SET "key" = 'app.user_menu.title' WHERE "key" = 'app.userMenu.title';
UPDATE public.translations SET "key" = 'app.widgets.json.edit_mode' WHERE "key" = 'app.widgets.json.editMode';
UPDATE public.translations SET "key" = 'app.common.move_down' WHERE "key" = 'system.entities.list.keys.moveDown';
UPDATE public.translations SET "key" = 'app.common.move_up' WHERE "key" = 'system.entities.list.keys.moveUp';
-- === system.translations renames ===
UPDATE system.translations SET "key" = 'system.entities.crm.pipeline.card_title' WHERE "key" = 'system.entities.crm.pipeline.cardTitle';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.create' WHERE "key" = 'system.entities.customer.versionHistory.actions.CREATE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.delete' WHERE "key" = 'system.entities.customer.versionHistory.actions.DELETE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.hard_delete' WHERE "key" = 'system.entities.customer.versionHistory.actions.HARD_DELETE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.insert' WHERE "key" = 'system.entities.customer.versionHistory.actions.INSERT';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.restore' WHERE "key" = 'system.entities.customer.versionHistory.actions.RESTORE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.soft_delete' WHERE "key" = 'system.entities.customer.versionHistory.actions.SOFT_DELETE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.actions.update' WHERE "key" = 'system.entities.customer.versionHistory.actions.UPDATE';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.changed_from' WHERE "key" = 'system.entities.customer.versionHistory.changedFrom';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.cleared' WHERE "key" = 'system.entities.customer.versionHistory.cleared';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.empty' WHERE "key" = 'system.entities.customer.versionHistory.empty';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.error' WHERE "key" = 'system.entities.customer.versionHistory.error';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.company_name' WHERE "key" = 'system.entities.customer.versionHistory.field.company_name';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.display_name' WHERE "key" = 'system.entities.customer.versionHistory.field.display_name';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.email' WHERE "key" = 'system.entities.customer.versionHistory.field.email';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.first_name' WHERE "key" = 'system.entities.customer.versionHistory.field.first_name';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.idp_code' WHERE "key" = 'system.entities.customer.versionHistory.field.idp_code';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.last_name' WHERE "key" = 'system.entities.customer.versionHistory.field.last_name';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.local_address' WHERE "key" = 'system.entities.customer.versionHistory.field.local_address';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.local_city' WHERE "key" = 'system.entities.customer.versionHistory.field.local_city';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.local_country' WHERE "key" = 'system.entities.customer.versionHistory.field.local_country';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.local_state' WHERE "key" = 'system.entities.customer.versionHistory.field.local_state';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.local_zip' WHERE "key" = 'system.entities.customer.versionHistory.field.local_zip';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.phone' WHERE "key" = 'system.entities.customer.versionHistory.field.phone';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.status' WHERE "key" = 'system.entities.customer.versionHistory.field.status';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field.status_reason' WHERE "key" = 'system.entities.customer.versionHistory.field.status_reason';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.field_modified' WHERE "key" = 'system.entities.customer.versionHistory.fieldModified';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.hide_details' WHERE "key" = 'system.entities.customer.versionHistory.hideDetails';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.loading' WHERE "key" = 'system.entities.customer.versionHistory.loading';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.not_set' WHERE "key" = 'system.entities.customer.versionHistory.notSet';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.null' WHERE "key" = 'system.entities.customer.versionHistory.null';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.record_created' WHERE "key" = 'system.entities.customer.versionHistory.recordCreated';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.record_deleted' WHERE "key" = 'system.entities.customer.versionHistory.recordDeleted';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.record_hard_deleted' WHERE "key" = 'system.entities.customer.versionHistory.recordHardDeleted';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.record_restored' WHERE "key" = 'system.entities.customer.versionHistory.recordRestored';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.record_soft_deleted' WHERE "key" = 'system.entities.customer.versionHistory.recordSoftDeleted';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.set' WHERE "key" = 'system.entities.customer.versionHistory.set';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.show_details' WHERE "key" = 'system.entities.customer.versionHistory.showDetails';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.title' WHERE "key" = 'system.entities.customer.versionHistory.title';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.to' WHERE "key" = 'system.entities.customer.versionHistory.to';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.unchanged' WHERE "key" = 'system.entities.customer.versionHistory.unchanged';
UPDATE system.translations SET "key" = 'system.entities.customer.version_history.view_more' WHERE "key" = 'system.entities.customer.versionHistory.viewMore';
UPDATE system.translations SET "key" = 'system.entities.list.add_filter' WHERE "key" = 'system.entities.list.addFilter';
UPDATE system.translations SET "key" = 'system.entities.list.advanced_filters' WHERE "key" = 'system.entities.list.advancedFilters';
UPDATE system.translations SET "key" = 'system.entities.list.advanced_filters_placeholder' WHERE "key" = 'system.entities.list.advancedFiltersPlaceholder';
UPDATE system.translations SET "key" = 'system.entities.list.all_criteria' WHERE "key" = 'system.entities.list.allCriteria';
UPDATE system.translations SET "key" = 'system.entities.list.at_least_one_criteria' WHERE "key" = 'system.entities.list.atLeastOneCriteria';
UPDATE system.translations SET "key" = 'system.entities.list.auditing_fields' WHERE "key" = 'system.entities.list.auditingFields';
UPDATE system.translations SET "key" = 'system.entities.list.boolean_any' WHERE "key" = 'system.entities.list.booleanAny';
UPDATE system.translations SET "key" = 'system.entities.list.boolean_false' WHERE "key" = 'system.entities.list.booleanFalse';
UPDATE system.translations SET "key" = 'system.entities.list.boolean_true' WHERE "key" = 'system.entities.list.booleanTrue';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.delete' WHERE "key" = 'system.entities.list.bulkActions.delete';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.delete_confirm_title' WHERE "key" = 'system.entities.list.bulkActions.deleteConfirmTitle';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.duplicate' WHERE "key" = 'system.entities.list.bulkActions.duplicate';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.export' WHERE "key" = 'system.entities.list.bulkActions.export';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.export_html' WHERE "key" = 'system.entities.list.bulkActions.exportHtml';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.restore' WHERE "key" = 'system.entities.list.bulkActions.restore';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.restore_confirm_title' WHERE "key" = 'system.entities.list.bulkActions.restoreConfirmTitle';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.toggle_to_bulk' WHERE "key" = 'system.entities.list.bulkActions.toggleToBulk';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_actions.toggle_to_filters' WHERE "key" = 'system.entities.list.bulkActions.toggleToFilters';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_delete_failed' WHERE "key" = 'system.entities.list.bulkDeleteFailed';
UPDATE system.translations SET "key" = 'system.entities.list.bulk_restore_failed' WHERE "key" = 'system.entities.list.bulkRestoreFailed';
UPDATE system.translations SET "key" = 'system.entities.list.data_fields' WHERE "key" = 'system.entities.list.dataFields';
UPDATE system.translations SET "key" = 'system.entities.list.datetime_iana.hint_browser' WHERE "key" = 'system.entities.list.datetimeIana.hintBrowser';
UPDATE system.translations SET "key" = 'system.entities.list.datetime_iana.hint_record' WHERE "key" = 'system.entities.list.datetimeIana.hintRecord';
UPDATE system.translations SET "key" = 'system.entities.list.deletion_filter.all' WHERE "key" = 'system.entities.list.deletionFilter.all';
UPDATE system.translations SET "key" = 'system.entities.list.deletion_filter.deleted' WHERE "key" = 'system.entities.list.deletionFilter.deleted';
UPDATE system.translations SET "key" = 'system.entities.list.deletion_filter.group_aria' WHERE "key" = 'system.entities.list.deletionFilter.groupAria';
UPDATE system.translations SET "key" = 'system.entities.list.deletion_filter.non_deleted' WHERE "key" = 'system.entities.list.deletionFilter.nonDeleted';
UPDATE system.translations SET "key" = 'system.entities.list.deselect_all' WHERE "key" = 'system.entities.list.deselectAll';
UPDATE system.translations SET "key" = 'system.entities.list.duplicate_max_limit' WHERE "key" = 'system.entities.list.duplicateMaxLimit';
UPDATE system.translations SET "key" = 'system.entities.list.duplicate_partial_success' WHERE "key" = 'system.entities.list.duplicatePartialSuccess';
UPDATE system.translations SET "key" = 'system.entities.list.duplicate_success' WHERE "key" = 'system.entities.list.duplicateSuccess';
UPDATE system.translations SET "key" = 'system.entities.list.edit_mode_label' WHERE "key" = 'system.entities.list.editModeLabel';
UPDATE system.translations SET "key" = 'system.entities.list.empty_field' WHERE "key" = 'system.entities.list.emptyField';
UPDATE system.translations SET "key" = 'system.entities.list.filter_badge.no_filters_applied' WHERE "key" = 'system.entities.list.filterBadge.noFiltersApplied';
UPDATE system.translations SET "key" = 'system.entities.list.filter_badge.separator' WHERE "key" = 'system.entities.list.filterBadge.separator';
UPDATE system.translations SET "key" = 'system.entities.list.filter_placeholder' WHERE "key" = 'system.entities.list.filterPlaceholder';
UPDATE system.translations SET "key" = 'system.entities.list.filter_value_hint' WHERE "key" = 'system.entities.list.filterValueHint';
UPDATE system.translations SET "key" = 'system.entities.list.filters_hint' WHERE "key" = 'system.entities.list.filtersHint';
UPDATE system.translations SET "key" = 'system.entities.list.in_order' WHERE "key" = 'system.entities.list.inOrder';
UPDATE system.translations SET "key" = 'system.entities.list.keyboard_commands' WHERE "key" = 'system.entities.list.keyboardCommands';
UPDATE system.translations SET "key" = 'system.entities.list.keys.first_last' WHERE "key" = 'system.entities.list.keys.firstLast';
UPDATE system.translations SET "key" = 'system.entities.list.no_filterable_fields' WHERE "key" = 'system.entities.list.noFilterableFields';
UPDATE system.translations SET "key" = 'system.entities.list.no_records' WHERE "key" = 'system.entities.list.noRecords';
UPDATE system.translations SET "key" = 'system.entities.list.no_selected_rows_in_view' WHERE "key" = 'system.entities.list.noSelectedRowsInView';
UPDATE system.translations SET "key" = 'system.entities.list.operators.neq' WHERE "key" = 'system.entities.list.operators.!=';
UPDATE system.translations SET "key" = 'system.entities.list.operators.lt' WHERE "key" = 'system.entities.list.operators.<';
UPDATE system.translations SET "key" = 'system.entities.list.operators.lte' WHERE "key" = 'system.entities.list.operators.<=';
UPDATE system.translations SET "key" = 'system.entities.list.operators.eq' WHERE "key" = 'system.entities.list.operators.=';
UPDATE system.translations SET "key" = 'system.entities.list.operators.gt' WHERE "key" = 'system.entities.list.operators.>';
UPDATE system.translations SET "key" = 'system.entities.list.operators.gte' WHERE "key" = 'system.entities.list.operators.>=';
UPDATE system.translations SET "key" = 'system.entities.list.operators.between' WHERE "key" = 'system.entities.list.operators.BETWEEN';
UPDATE system.translations SET "key" = 'system.entities.list.operators.ends_with' WHERE "key" = 'system.entities.list.operators.endsWith';
UPDATE system.translations SET "key" = 'system.entities.list.operators.starts_with' WHERE "key" = 'system.entities.list.operators.startsWith';
UPDATE system.translations SET "key" = 'system.entities.list.page_size' WHERE "key" = 'system.entities.list.pageSize';
UPDATE system.translations SET "key" = 'system.entities.list.pagination.first_page' WHERE "key" = 'system.entities.list.pagination.firstPage';
UPDATE system.translations SET "key" = 'system.entities.list.pagination.last_page' WHERE "key" = 'system.entities.list.pagination.lastPage';
UPDATE system.translations SET "key" = 'system.entities.list.pagination.next_page' WHERE "key" = 'system.entities.list.pagination.nextPage';
UPDATE system.translations SET "key" = 'system.entities.list.pagination.previous_page' WHERE "key" = 'system.entities.list.pagination.previousPage';
UPDATE system.translations SET "key" = 'system.entities.list.pagination_status' WHERE "key" = 'system.entities.list.paginationStatus';
UPDATE system.translations SET "key" = 'system.entities.list.preview_panel_title' WHERE "key" = 'system.entities.list.previewPanelTitle';
UPDATE system.translations SET "key" = 'system.entities.list.row_actions' WHERE "key" = 'system.entities.list.rowActions';
UPDATE system.translations SET "key" = 'system.entities.list.search_fields' WHERE "key" = 'system.entities.list.searchFields';
UPDATE system.translations SET "key" = 'system.entities.list.search_in' WHERE "key" = 'system.entities.list.searchIn';
UPDATE system.translations SET "key" = 'system.entities.list.search_in_all' WHERE "key" = 'system.entities.list.searchInAll';
UPDATE system.translations SET "key" = 'system.entities.list.search_in_fields' WHERE "key" = 'system.entities.list.searchInFields';
UPDATE system.translations SET "key" = 'system.entities.list.search_placeholder' WHERE "key" = 'system.entities.list.searchPlaceholder';
UPDATE system.translations SET "key" = 'system.entities.list.select_all' WHERE "key" = 'system.entities.list.selectAll';
UPDATE system.translations SET "key" = 'system.entities.list.select_field' WHERE "key" = 'system.entities.list.selectField';
UPDATE system.translations SET "key" = 'system.entities.list.select_row' WHERE "key" = 'system.entities.list.selectRow';
UPDATE system.translations SET "key" = 'system.entities.list.select_value' WHERE "key" = 'system.entities.list.selectValue';
UPDATE system.translations SET "key" = 'system.entities.list.selected_plural' WHERE "key" = 'system.entities.list.selectedPlural';
UPDATE system.translations SET "key" = 'system.entities.list.selected_rows_not_loaded_hint' WHERE "key" = 'system.entities.list.selectedRowsNotLoadedHint';
UPDATE system.translations SET "key" = 'system.entities.list.selected_singular' WHERE "key" = 'system.entities.list.selectedSingular';
UPDATE system.translations SET "key" = 'system.entities.list.sort_by' WHERE "key" = 'system.entities.list.sortBy';
UPDATE system.translations SET "key" = 'system.entities.list.standard_filters' WHERE "key" = 'system.entities.list.standardFilters';
UPDATE system.translations SET "key" = 'system.entities.list.sticky_fields' WHERE "key" = 'system.entities.list.stickyFields';
UPDATE system.translations SET "key" = 'system.entities.list.toggle_preview_panel' WHERE "key" = 'system.entities.list.togglePreviewPanel';
UPDATE system.translations SET "key" = 'system.entities.list.view_all_rows_title' WHERE "key" = 'system.entities.list.viewAllRowsTitle';
UPDATE system.translations SET "key" = 'system.entities.list.view_mode.cards' WHERE "key" = 'system.entities.list.viewMode.cards';
UPDATE system.translations SET "key" = 'system.entities.list.view_mode.cards_list' WHERE "key" = 'system.entities.list.viewMode.cardsList';
UPDATE system.translations SET "key" = 'system.entities.list.view_mode.group_aria' WHERE "key" = 'system.entities.list.viewMode.groupAria';
UPDATE system.translations SET "key" = 'system.entities.list.view_mode.table' WHERE "key" = 'system.entities.list.viewMode.table';
UPDATE system.translations SET "key" = 'system.entities.list.view_mode_label' WHERE "key" = 'system.entities.list.viewModeLabel';
UPDATE system.translations SET "key" = 'system.entities.list.view_selected_only_title' WHERE "key" = 'system.entities.list.viewSelectedOnlyTitle';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.create' WHERE "key" = 'system.entities.versionHistory.actions.CREATE';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.delete' WHERE "key" = 'system.entities.versionHistory.actions.DELETE';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.hard_delete' WHERE "key" = 'system.entities.versionHistory.actions.HARD_DELETE';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.insert' WHERE "key" = 'system.entities.versionHistory.actions.INSERT';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.restore' WHERE "key" = 'system.entities.versionHistory.actions.RESTORE';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.soft_delete' WHERE "key" = 'system.entities.versionHistory.actions.SOFT_DELETE';
UPDATE system.translations SET "key" = 'system.entities.version_history.actions.update' WHERE "key" = 'system.entities.versionHistory.actions.UPDATE';
UPDATE system.translations SET "key" = 'system.entities.version_history.changed_from' WHERE "key" = 'system.entities.versionHistory.changedFrom';
UPDATE system.translations SET "key" = 'system.entities.version_history.cleared' WHERE "key" = 'system.entities.versionHistory.cleared';
UPDATE system.translations SET "key" = 'system.entities.version_history.empty' WHERE "key" = 'system.entities.versionHistory.empty';
UPDATE system.translations SET "key" = 'system.entities.version_history.empty_list' WHERE "key" = 'system.entities.versionHistory.emptyList';
UPDATE system.translations SET "key" = 'system.entities.version_history.error' WHERE "key" = 'system.entities.versionHistory.error';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.created_at' WHERE "key" = 'system.entities.versionHistory.field.created_at';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.created_by' WHERE "key" = 'system.entities.versionHistory.field.created_by';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.deleted_at' WHERE "key" = 'system.entities.versionHistory.field.deleted_at';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.deleted_by' WHERE "key" = 'system.entities.versionHistory.field.deleted_by';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.description_key' WHERE "key" = 'system.entities.versionHistory.field.description_key';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.display_name' WHERE "key" = 'system.entities.versionHistory.field.display_name';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.group_key' WHERE "key" = 'system.entities.versionHistory.field.group_key';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.id' WHERE "key" = 'system.entities.versionHistory.field.id';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.idp_code' WHERE "key" = 'system.entities.versionHistory.field.idp_code';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.idp_name' WHERE "key" = 'system.entities.versionHistory.field.idp_name';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.idp_owner' WHERE "key" = 'system.entities.versionHistory.field.idp_owner';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.key' WHERE "key" = 'system.entities.versionHistory.field.key';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.label_key' WHERE "key" = 'system.entities.versionHistory.field.label_key';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.last_synced_at' WHERE "key" = 'system.entities.versionHistory.field.last_synced_at';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.reserved' WHERE "key" = 'system.entities.versionHistory.field.reserved';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.type' WHERE "key" = 'system.entities.versionHistory.field.type';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.type_config' WHERE "key" = 'system.entities.versionHistory.field.type_config';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.updated_at' WHERE "key" = 'system.entities.versionHistory.field.updated_at';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.updated_by' WHERE "key" = 'system.entities.versionHistory.field.updated_by';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.user_count' WHERE "key" = 'system.entities.versionHistory.field.user_count';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.uuid' WHERE "key" = 'system.entities.versionHistory.field.uuid';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.value' WHERE "key" = 'system.entities.versionHistory.field.value';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.version' WHERE "key" = 'system.entities.versionHistory.field.version';
UPDATE system.translations SET "key" = 'system.entities.version_history.field.website_url' WHERE "key" = 'system.entities.versionHistory.field.website_url';
UPDATE system.translations SET "key" = 'system.entities.version_history.field_modified' WHERE "key" = 'system.entities.versionHistory.fieldModified';
UPDATE system.translations SET "key" = 'system.entities.version_history.hide_details' WHERE "key" = 'system.entities.versionHistory.hideDetails';
UPDATE system.translations SET "key" = 'system.entities.version_history.loading' WHERE "key" = 'system.entities.versionHistory.loading';
UPDATE system.translations SET "key" = 'system.entities.version_history.not_set' WHERE "key" = 'system.entities.versionHistory.notSet';
UPDATE system.translations SET "key" = 'system.entities.version_history.null' WHERE "key" = 'system.entities.versionHistory.null';
UPDATE system.translations SET "key" = 'system.entities.version_history.record_created' WHERE "key" = 'system.entities.versionHistory.recordCreated';
UPDATE system.translations SET "key" = 'system.entities.version_history.record_hard_deleted' WHERE "key" = 'system.entities.versionHistory.recordHardDeleted';
UPDATE system.translations SET "key" = 'system.entities.version_history.record_restored' WHERE "key" = 'system.entities.versionHistory.recordRestored';
UPDATE system.translations SET "key" = 'system.entities.version_history.record_soft_deleted' WHERE "key" = 'system.entities.versionHistory.recordSoftDeleted';
UPDATE system.translations SET "key" = 'system.entities.version_history.set' WHERE "key" = 'system.entities.versionHistory.set';
UPDATE system.translations SET "key" = 'system.entities.version_history.show_details' WHERE "key" = 'system.entities.versionHistory.showDetails';
UPDATE system.translations SET "key" = 'system.entities.version_history.title' WHERE "key" = 'system.entities.versionHistory.title';
UPDATE system.translations SET "key" = 'system.entities.version_history.to' WHERE "key" = 'system.entities.versionHistory.to';
UPDATE system.translations SET "key" = 'system.entities.version_history.unchanged' WHERE "key" = 'system.entities.versionHistory.unchanged';
UPDATE system.translations SET "key" = 'system.entities.version_history.view_more' WHERE "key" = 'system.entities.versionHistory.viewMore';
UPDATE system.translations SET "key" = 'system.migrations.action_failed' WHERE "key" = 'system.migrations.actionFailed';
UPDATE system.translations SET "key" = 'system.migrations.actions.drift_check' WHERE "key" = 'system.migrations.actions.driftCheck';
UPDATE system.translations SET "key" = 'system.migrations.approve_ok' WHERE "key" = 'system.migrations.approveOk';
UPDATE system.translations SET "key" = 'system.migrations.columns.applied_at' WHERE "key" = 'system.migrations.columns.appliedAt';
UPDATE system.translations SET "key" = 'system.migrations.columns.signed_by' WHERE "key" = 'system.migrations.columns.signedBy';
UPDATE system.translations SET "key" = 'system.migrations.dialog.approve_title' WHERE "key" = 'system.migrations.dialog.approveTitle';
UPDATE system.translations SET "key" = 'system.migrations.dialog.resolve_title' WHERE "key" = 'system.migrations.dialog.resolveTitle';
UPDATE system.translations SET "key" = 'system.migrations.last_error' WHERE "key" = 'system.migrations.lastError';
UPDATE system.translations SET "key" = 'system.migrations.no_patches' WHERE "key" = 'system.migrations.noPatches';
UPDATE system.translations SET "key" = 'system.migrations.resolve_ok' WHERE "key" = 'system.migrations.resolveOk';
UPDATE system.translations SET "key" = 'system.migrations.retry_ok' WHERE "key" = 'system.migrations.retryOk';
UPDATE system.translations SET "key" = 'system.roles.test_role' WHERE "key" = 'system.roles.testRole';
UPDATE system.translations SET "key" = 'system.settings.audit.created_at' WHERE "key" = 'system.settings.audit.createdAt';
UPDATE system.translations SET "key" = 'system.settings.audit.created_by' WHERE "key" = 'system.settings.audit.createdBy';
UPDATE system.translations SET "key" = 'system.settings.audit.deleted_at' WHERE "key" = 'system.settings.audit.deletedAt';
UPDATE system.translations SET "key" = 'system.settings.audit.deleted_by' WHERE "key" = 'system.settings.audit.deletedBy';
UPDATE system.translations SET "key" = 'system.settings.audit.last_synced_at' WHERE "key" = 'system.settings.audit.lastSyncedAt';
UPDATE system.translations SET "key" = 'system.settings.audit.updated_at' WHERE "key" = 'system.settings.audit.updatedAt';
UPDATE system.translations SET "key" = 'system.settings.audit.updated_by' WHERE "key" = 'system.settings.audit.updatedBy';
UPDATE system.translations SET "key" = 'system.settings.breadcrumb_menu' WHERE "key" = 'system.settings.breadcrumbMenu';
UPDATE system.translations SET "key" = 'system.settings.config.auth.auth_roles_path.errors.invalid_format' WHERE "key" = 'system.settings.config.auth.auth_roles_path.errors.invalidFormat';
UPDATE system.translations SET "key" = 'system.settings.config.auth.oidc_client_id.errors.invalid_format' WHERE "key" = 'system.settings.config.auth.oidc_client_id.errors.invalidFormat';
UPDATE system.translations SET "key" = 'system.settings.config.currency_select.all_currencies' WHERE "key" = 'system.settings.config.currencySelect.allCurrencies';
UPDATE system.translations SET "key" = 'system.settings.config.currency_select.favorites' WHERE "key" = 'system.settings.config.currencySelect.favorites';
UPDATE system.translations SET "key" = 'system.settings.config.currency_select.no_results' WHERE "key" = 'system.settings.config.currencySelect.noResults';
UPDATE system.translations SET "key" = 'system.settings.config.currency_select.search_placeholder' WHERE "key" = 'system.settings.config.currencySelect.searchPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.config.currency_select.title' WHERE "key" = 'system.settings.config.currencySelect.title';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.all_countries' WHERE "key" = 'system.settings.config.phonePrefixSelect.allCountries';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.no_results' WHERE "key" = 'system.settings.config.phonePrefixSelect.noResults';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.search_placeholder' WHERE "key" = 'system.settings.config.phonePrefixSelect.searchPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.sort_by_name' WHERE "key" = 'system.settings.config.phonePrefixSelect.sortByName';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.sort_by_prefix' WHERE "key" = 'system.settings.config.phonePrefixSelect.sortByPrefix';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.suggested' WHERE "key" = 'system.settings.config.phonePrefixSelect.suggested';
UPDATE system.translations SET "key" = 'system.settings.config.phone_prefix_select.title' WHERE "key" = 'system.settings.config.phonePrefixSelect.title';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.ftp' WHERE "key" = 'system.settings.config.protocolSelect.desc.ftp';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.http' WHERE "key" = 'system.settings.config.protocolSelect.desc.http';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.https' WHERE "key" = 'system.settings.config.protocolSelect.desc.https';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.mailto' WHERE "key" = 'system.settings.config.protocolSelect.desc.mailto';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.redis' WHERE "key" = 'system.settings.config.protocolSelect.desc.redis';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.rediss' WHERE "key" = 'system.settings.config.protocolSelect.desc.rediss';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.tcp' WHERE "key" = 'system.settings.config.protocolSelect.desc.tcp';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.ws' WHERE "key" = 'system.settings.config.protocolSelect.desc.ws';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.desc.wss' WHERE "key" = 'system.settings.config.protocolSelect.desc.wss';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.no_results' WHERE "key" = 'system.settings.config.protocolSelect.noResults';
UPDATE system.translations SET "key" = 'system.settings.config.protocol_select.title' WHERE "key" = 'system.settings.config.protocolSelect.title';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.add_value' WHERE "key" = 'system.settings.config.typeConfig.addValue';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.advanced_mode' WHERE "key" = 'system.settings.config.typeConfig.advancedMode';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.advanced_mode_help' WHERE "key" = 'system.settings.config.typeConfig.advancedModeHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_countries' WHERE "key" = 'system.settings.config.typeConfig.allowedCountries';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_countries_help' WHERE "key" = 'system.settings.config.typeConfig.allowedCountriesHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_currencies' WHERE "key" = 'system.settings.config.typeConfig.allowedCurrencies';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_currencies_help' WHERE "key" = 'system.settings.config.typeConfig.allowedCurrenciesHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_protocols' WHERE "key" = 'system.settings.config.typeConfig.allowedProtocols';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.allowed_protocols_help' WHERE "key" = 'system.settings.config.typeConfig.allowedProtocolsHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.api_url' WHERE "key" = 'system.settings.config.typeConfig.apiUrl';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_add_title' WHERE "key" = 'system.settings.config.typeConfig.badgeAddTitle';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_code' WHERE "key" = 'system.settings.config.typeConfig.badgeCode';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_code_duplicate' WHERE "key" = 'system.settings.config.typeConfig.badgeCodeDuplicate';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_code_help' WHERE "key" = 'system.settings.config.typeConfig.badgeCodeHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_code_invalid' WHERE "key" = 'system.settings.config.typeConfig.badgeCodeInvalid';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_color' WHERE "key" = 'system.settings.config.typeConfig.badgeColor';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_color_help' WHERE "key" = 'system.settings.config.typeConfig.badgeColorHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_edit_title' WHERE "key" = 'system.settings.config.typeConfig.badgeEditTitle';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_label_key' WHERE "key" = 'system.settings.config.typeConfig.badgeLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_label_key_help' WHERE "key" = 'system.settings.config.typeConfig.badgeLabelKeyHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.badge_values' WHERE "key" = 'system.settings.config.typeConfig.badgeValues';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.builtin_source' WHERE "key" = 'system.settings.config.typeConfig.builtinSource';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_country' WHERE "key" = 'system.settings.config.typeConfig.defaultCountry';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_country_help' WHERE "key" = 'system.settings.config.typeConfig.defaultCountryHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_currency' WHERE "key" = 'system.settings.config.typeConfig.defaultCurrency';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_currency_help' WHERE "key" = 'system.settings.config.typeConfig.defaultCurrencyHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_protocol' WHERE "key" = 'system.settings.config.typeConfig.defaultProtocol';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.default_protocol_help' WHERE "key" = 'system.settings.config.typeConfig.defaultProtocolHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.email_validation' WHERE "key" = 'system.settings.config.typeConfig.emailValidation';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.email_validation_help' WHERE "key" = 'system.settings.config.typeConfig.emailValidationHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.error_label_key' WHERE "key" = 'system.settings.config.typeConfig.errorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.http_verb' WHERE "key" = 'system.settings.config.typeConfig.httpVerb';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.invalid_json' WHERE "key" = 'system.settings.config.typeConfig.invalidJson';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.json_preview' WHERE "key" = 'system.settings.config.typeConfig.jsonPreview';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.label_field' WHERE "key" = 'system.settings.config.typeConfig.labelField';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.max_error_label_key' WHERE "key" = 'system.settings.config.typeConfig.maxErrorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.max_help' WHERE "key" = 'system.settings.config.typeConfig.maxHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.max_length' WHERE "key" = 'system.settings.config.typeConfig.maxLength';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.max_value' WHERE "key" = 'system.settings.config.typeConfig.maxValue';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.min_error_label_key' WHERE "key" = 'system.settings.config.typeConfig.minErrorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.min_help' WHERE "key" = 'system.settings.config.typeConfig.minHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.min_length' WHERE "key" = 'system.settings.config.typeConfig.minLength';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.min_value' WHERE "key" = 'system.settings.config.typeConfig.minValue';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.money_config' WHERE "key" = 'system.settings.config.typeConfig.moneyConfig';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.no_badge_values' WHERE "key" = 'system.settings.config.typeConfig.noBadgeValues';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.phone_config' WHERE "key" = 'system.settings.config.typeConfig.phoneConfig';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.regex_error_label_key' WHERE "key" = 'system.settings.config.typeConfig.regexErrorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.regex_pattern' WHERE "key" = 'system.settings.config.typeConfig.regexPattern';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.regex_pattern_help' WHERE "key" = 'system.settings.config.typeConfig.regexPatternHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.regex_pattern_placeholder' WHERE "key" = 'system.settings.config.typeConfig.regexPatternPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.remove' WHERE "key" = 'system.settings.config.typeConfig.remove';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.required' WHERE "key" = 'system.settings.config.typeConfig.required';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.required_error_label_key' WHERE "key" = 'system.settings.config.typeConfig.requiredErrorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.required_help' WHERE "key" = 'system.settings.config.typeConfig.requiredHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.select_config' WHERE "key" = 'system.settings.config.typeConfig.selectConfig';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.select_source' WHERE "key" = 'system.settings.config.typeConfig.selectSource';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.source_api' WHERE "key" = 'system.settings.config.typeConfig.sourceApi';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.source_builtin' WHERE "key" = 'system.settings.config.typeConfig.sourceBuiltin';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.source_mode' WHERE "key" = 'system.settings.config.typeConfig.sourceMode';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.unsigned' WHERE "key" = 'system.settings.config.typeConfig.unsigned';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.unsigned_help' WHERE "key" = 'system.settings.config.typeConfig.unsignedHelp';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.url_config' WHERE "key" = 'system.settings.config.typeConfig.urlConfig';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.url_error_label_key' WHERE "key" = 'system.settings.config.typeConfig.urlErrorLabelKey';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.url_protocols' WHERE "key" = 'system.settings.config.typeConfig.urlProtocols';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.validation_rules' WHERE "key" = 'system.settings.config.typeConfig.validationRules';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.value_field' WHERE "key" = 'system.settings.config.typeConfig.valueField';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.values_source.ai_models' WHERE "key" = 'system.settings.config.typeConfig.valuesSource.ai_models';
UPDATE system.translations SET "key" = 'system.settings.config.type_config.values_source.currencies' WHERE "key" = 'system.settings.config.typeConfig.valuesSource.currencies';
UPDATE system.translations SET "key" = 'system.settings.configurations.add_config_key' WHERE "key" = 'system.settings.configurations.addConfigKey';
UPDATE system.translations SET "key" = 'system.settings.configurations.bulk_delete' WHERE "key" = 'system.settings.configurations.bulkDelete';
UPDATE system.translations SET "key" = 'system.settings.configurations.changes_pending_count' WHERE "key" = 'system.settings.configurations.changesPendingCount';
UPDATE system.translations SET "key" = 'system.settings.configurations.changes_pending_fields' WHERE "key" = 'system.settings.configurations.changesPendingFields';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.create_success' WHERE "key" = 'system.settings.configurations.create.createSuccess';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.description_key' WHERE "key" = 'system.settings.configurations.create.descriptionKey';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.description_key_help' WHERE "key" = 'system.settings.configurations.create.descriptionKeyHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.group_key' WHERE "key" = 'system.settings.configurations.create.groupKey';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.group_key_help' WHERE "key" = 'system.settings.configurations.create.groupKeyHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.group_key_placeholder' WHERE "key" = 'system.settings.configurations.create.groupKeyPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.group_key_search' WHERE "key" = 'system.settings.configurations.create.groupKeySearch';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.key_exists' WHERE "key" = 'system.settings.configurations.create.keyExists';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.key_help' WHERE "key" = 'system.settings.configurations.create.keyHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.key_placeholder' WHERE "key" = 'system.settings.configurations.create.keyPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.label_key' WHERE "key" = 'system.settings.configurations.create.labelKey';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.label_key_help' WHERE "key" = 'system.settings.configurations.create.labelKeyHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.reserved_help' WHERE "key" = 'system.settings.configurations.create.reservedHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.type_config' WHERE "key" = 'system.settings.configurations.create.typeConfig';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.type_help' WHERE "key" = 'system.settings.configurations.create.typeHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.unsaved_changes' WHERE "key" = 'system.settings.configurations.create.unsavedChanges';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.value_help' WHERE "key" = 'system.settings.configurations.create.valueHelp';
UPDATE system.translations SET "key" = 'system.settings.configurations.create.value_placeholder' WHERE "key" = 'system.settings.configurations.create.valuePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.configurations.no_changes' WHERE "key" = 'system.settings.configurations.noChanges';
UPDATE system.translations SET "key" = 'system.settings.configurations.no_entries' WHERE "key" = 'system.settings.configurations.noEntries';
UPDATE system.translations SET "key" = 'system.settings.configurations.reserved_badge' WHERE "key" = 'system.settings.configurations.reservedBadge';
UPDATE system.translations SET "key" = 'system.settings.credentials.change_password.button' WHERE "key" = 'system.settings.credentials.changePassword.button';
UPDATE system.translations SET "key" = 'system.settings.credentials.change_password.description' WHERE "key" = 'system.settings.credentials.changePassword.description';
UPDATE system.translations SET "key" = 'system.settings.credentials.change_password.title' WHERE "key" = 'system.settings.credentials.changePassword.title';
UPDATE system.translations SET "key" = 'system.settings.modules.behind_scaler' WHERE "key" = 'system.settings.modules.behindScaler';
UPDATE system.translations SET "key" = 'system.settings.modules.config.base_url' WHERE "key" = 'system.settings.modules.config.baseUrl';
UPDATE system.translations SET "key" = 'system.settings.modules.config.config_not_available' WHERE "key" = 'system.settings.modules.config.configNotAvailable';
UPDATE system.translations SET "key" = 'system.settings.modules.config.github_repo_url' WHERE "key" = 'system.settings.modules.config.githubRepoUrl';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_placeholder' WHERE "key" = 'system.settings.modules.config.iconPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_type' WHERE "key" = 'system.settings.modules.config.iconType';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_type_base64' WHERE "key" = 'system.settings.modules.config.iconTypeBase64';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_type_icon' WHERE "key" = 'system.settings.modules.config.iconTypeIcon';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_type_svg' WHERE "key" = 'system.settings.modules.config.iconTypeSvg';
UPDATE system.translations SET "key" = 'system.settings.modules.config.icon_type_url' WHERE "key" = 'system.settings.modules.config.iconTypeUrl';
UPDATE system.translations SET "key" = 'system.settings.modules.config.module_config' WHERE "key" = 'system.settings.modules.config.moduleConfig';
UPDATE system.translations SET "key" = 'system.settings.modules.config.no_config_entries' WHERE "key" = 'system.settings.modules.config.noConfigEntries';
UPDATE system.translations SET "key" = 'system.settings.modules.config.service_info' WHERE "key" = 'system.settings.modules.config.serviceInfo';
UPDATE system.translations SET "key" = 'system.settings.modules.config.service_version' WHERE "key" = 'system.settings.modules.config.serviceVersion';
UPDATE system.translations SET "key" = 'system.settings.modules.config.service_version_hint' WHERE "key" = 'system.settings.modules.config.serviceVersionHint';
UPDATE system.translations SET "key" = 'system.settings.modules.delete_failed' WHERE "key" = 'system.settings.modules.deleteFailed';
UPDATE system.translations SET "key" = 'system.settings.modules.import_module' WHERE "key" = 'system.settings.modules.importModule';
UPDATE system.translations SET "key" = 'system.settings.modules.installed_modules' WHERE "key" = 'system.settings.modules.installedModules';
UPDATE system.translations SET "key" = 'system.settings.modules.last_seen' WHERE "key" = 'system.settings.modules.lastSeen';
UPDATE system.translations SET "key" = 'system.settings.modules.load_failed' WHERE "key" = 'system.settings.modules.loadFailed';
UPDATE system.translations SET "key" = 'system.settings.modules.module_deleted' WHERE "key" = 'system.settings.modules.moduleDeleted';
UPDATE system.translations SET "key" = 'system.settings.modules.module_disabled' WHERE "key" = 'system.settings.modules.moduleDisabled';
UPDATE system.translations SET "key" = 'system.settings.modules.module_enabled' WHERE "key" = 'system.settings.modules.moduleEnabled';
UPDATE system.translations SET "key" = 'system.settings.modules.no_modules' WHERE "key" = 'system.settings.modules.noModules';
UPDATE system.translations SET "key" = 'system.settings.modules.no_modules_hint' WHERE "key" = 'system.settings.modules.noModulesHint';
UPDATE system.translations SET "key" = 'system.settings.modules.not_implemented' WHERE "key" = 'system.settings.modules.notImplemented';
UPDATE system.translations SET "key" = 'system.settings.modules.open_marketplace' WHERE "key" = 'system.settings.modules.openMarketplace';
UPDATE system.translations SET "key" = 'system.settings.modules.toggle_failed' WHERE "key" = 'system.settings.modules.toggleFailed';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.copy_idp_code' WHERE "key" = 'system.settings.organizations.create.copyIdpCode';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.copy_idp_owner' WHERE "key" = 'system.settings.organizations.create.copyIdpOwner';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.display_name' WHERE "key" = 'system.settings.organizations.create.displayName';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.display_name_placeholder' WHERE "key" = 'system.settings.organizations.create.displayNamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.idp_code' WHERE "key" = 'system.settings.organizations.create.idpCode';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.idp_name' WHERE "key" = 'system.settings.organizations.create.idpName';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.idp_owner' WHERE "key" = 'system.settings.organizations.create.idpOwner';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.unsaved_changes' WHERE "key" = 'system.settings.organizations.create.unsavedChanges';
UPDATE system.translations SET "key" = 'system.settings.organizations.create.website_url' WHERE "key" = 'system.settings.organizations.create.websiteUrl';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.copy_idp_code' WHERE "key" = 'system.settings.organizations.update.copyIdpCode';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.copy_idp_name' WHERE "key" = 'system.settings.organizations.update.copyIdpName';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.copy_idp_owner' WHERE "key" = 'system.settings.organizations.update.copyIdpOwner';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.display_name' WHERE "key" = 'system.settings.organizations.update.displayName';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.display_name_placeholder' WHERE "key" = 'system.settings.organizations.update.displayNamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.idp_code' WHERE "key" = 'system.settings.organizations.update.idpCode';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.idp_name' WHERE "key" = 'system.settings.organizations.update.idpName';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.idp_owner' WHERE "key" = 'system.settings.organizations.update.idpOwner';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.unsaved_changes' WHERE "key" = 'system.settings.organizations.update.unsavedChanges';
UPDATE system.translations SET "key" = 'system.settings.organizations.update.website_url' WHERE "key" = 'system.settings.organizations.update.websiteUrl';
UPDATE system.translations SET "key" = 'system.settings.profile.avatar_color' WHERE "key" = 'system.settings.profile.avatarColor';
UPDATE system.translations SET "key" = 'system.settings.profile.copy_idp_code' WHERE "key" = 'system.settings.profile.copyIdpCode';
UPDATE system.translations SET "key" = 'system.settings.profile.copy_idp_issuer' WHERE "key" = 'system.settings.profile.copyIdpIssuer';
UPDATE system.translations SET "key" = 'system.settings.profile.copy_idp_name' WHERE "key" = 'system.settings.profile.copyIdpName';
UPDATE system.translations SET "key" = 'system.settings.profile.copy_idp_owner' WHERE "key" = 'system.settings.profile.copyIdpOwner';
UPDATE system.translations SET "key" = 'system.settings.profile.created_at' WHERE "key" = 'system.settings.profile.createdAt';
UPDATE system.translations SET "key" = 'system.settings.profile.created_by' WHERE "key" = 'system.settings.profile.createdBy';
UPDATE system.translations SET "key" = 'system.settings.profile.display_name' WHERE "key" = 'system.settings.profile.displayName';
UPDATE system.translations SET "key" = 'system.settings.profile.display_name_placeholder' WHERE "key" = 'system.settings.profile.displayNamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.profile.email_placeholder' WHERE "key" = 'system.settings.profile.emailPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_admin' WHERE "key" = 'system.settings.profile.idpAdmin';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_code' WHERE "key" = 'system.settings.profile.idpCode';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_email_verified' WHERE "key" = 'system.settings.profile.idpEmailVerified';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_issuer' WHERE "key" = 'system.settings.profile.idpIssuer';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_name' WHERE "key" = 'system.settings.profile.idpName';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_owner' WHERE "key" = 'system.settings.profile.idpOwner';
UPDATE system.translations SET "key" = 'system.settings.profile.idp_verified' WHERE "key" = 'system.settings.profile.idpVerified';
UPDATE system.translations SET "key" = 'system.settings.profile.roles_placeholder' WHERE "key" = 'system.settings.profile.rolesPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.profile.select_color' WHERE "key" = 'system.settings.profile.selectColor';
UPDATE system.translations SET "key" = 'system.settings.profile.unsaved_changes' WHERE "key" = 'system.settings.profile.unsavedChanges';
UPDATE system.translations SET "key" = 'system.settings.profile.updated_at' WHERE "key" = 'system.settings.profile.updatedAt';
UPDATE system.translations SET "key" = 'system.settings.profile.updated_by' WHERE "key" = 'system.settings.profile.updatedBy';
UPDATE system.translations SET "key" = 'system.settings.roles.col_actions' WHERE "key" = 'system.settings.roles.colActions';
UPDATE system.translations SET "key" = 'system.settings.roles.col_admin' WHERE "key" = 'system.settings.roles.colAdmin';
UPDATE system.translations SET "key" = 'system.settings.roles.col_idp_org' WHERE "key" = 'system.settings.roles.colIdpOrg';
UPDATE system.translations SET "key" = 'system.settings.roles.col_idp_role' WHERE "key" = 'system.settings.roles.colIdpRole';
UPDATE system.translations SET "key" = 'system.settings.roles.col_label' WHERE "key" = 'system.settings.roles.colLabel';
UPDATE system.translations SET "key" = 'system.settings.roles.col_last_synced' WHERE "key" = 'system.settings.roles.colLastSynced';
UPDATE system.translations SET "key" = 'system.settings.roles.col_permissions' WHERE "key" = 'system.settings.roles.colPermissions';
UPDATE system.translations SET "key" = 'system.settings.roles.create_subtitle' WHERE "key" = 'system.settings.roles.createSubtitle';
UPDATE system.translations SET "key" = 'system.settings.roles.create_title' WHERE "key" = 'system.settings.roles.createTitle';
UPDATE system.translations SET "key" = 'system.settings.roles.delete_confirm_body' WHERE "key" = 'system.settings.roles.deleteConfirmBody';
UPDATE system.translations SET "key" = 'system.settings.roles.delete_confirm_title' WHERE "key" = 'system.settings.roles.deleteConfirmTitle';
UPDATE system.translations SET "key" = 'system.settings.roles.edit_subtitle' WHERE "key" = 'system.settings.roles.editSubtitle';
UPDATE system.translations SET "key" = 'system.settings.roles.edit_title' WHERE "key" = 'system.settings.roles.editTitle';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_org' WHERE "key" = 'system.settings.roles.fieldIdpOrg';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_org_hint' WHERE "key" = 'system.settings.roles.fieldIdpOrgHint';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_org_immutable' WHERE "key" = 'system.settings.roles.fieldIdpOrgImmutable';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_org_placeholder' WHERE "key" = 'system.settings.roles.fieldIdpOrgPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_role' WHERE "key" = 'system.settings.roles.fieldIdpRole';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_role_hint' WHERE "key" = 'system.settings.roles.fieldIdpRoleHint';
UPDATE system.translations SET "key" = 'system.settings.roles.field_idp_role_immutable' WHERE "key" = 'system.settings.roles.fieldIdpRoleImmutable';
UPDATE system.translations SET "key" = 'system.settings.roles.field_is_admin' WHERE "key" = 'system.settings.roles.fieldIsAdmin';
UPDATE system.translations SET "key" = 'system.settings.roles.field_is_admin_hint' WHERE "key" = 'system.settings.roles.fieldIsAdminHint';
UPDATE system.translations SET "key" = 'system.settings.roles.field_label_key' WHERE "key" = 'system.settings.roles.fieldLabelKey';
UPDATE system.translations SET "key" = 'system.settings.roles.field_label_key_hint' WHERE "key" = 'system.settings.roles.fieldLabelKeyHint';
UPDATE system.translations SET "key" = 'system.settings.roles.last_synced' WHERE "key" = 'system.settings.roles.lastSynced';
UPDATE system.translations SET "key" = 'system.settings.roles.mode_hide' WHERE "key" = 'system.settings.roles.modeHide';
UPDATE system.translations SET "key" = 'system.settings.roles.mode_show_all' WHERE "key" = 'system.settings.roles.modeShowAll';
UPDATE system.translations SET "key" = 'system.settings.roles.not_found' WHERE "key" = 'system.settings.roles.notFound';
UPDATE system.translations SET "key" = 'system.settings.roles.permissions_empty' WHERE "key" = 'system.settings.roles.permissionsEmpty';
UPDATE system.translations SET "key" = 'system.settings.roles.permissions_loading' WHERE "key" = 'system.settings.roles.permissionsLoading';
UPDATE system.translations SET "key" = 'system.settings.roles.search_placeholder' WHERE "key" = 'system.settings.roles.searchPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.roles.tab_details' WHERE "key" = 'system.settings.roles.tabDetails';
UPDATE system.translations SET "key" = 'system.settings.roles.tab_permissions' WHERE "key" = 'system.settings.roles.tabPermissions';
UPDATE system.translations SET "key" = 'system.settings.roles.validation.idp_org_required' WHERE "key" = 'system.settings.roles.validation.idpOrgRequired';
UPDATE system.translations SET "key" = 'system.settings.roles.validation.idp_role_format' WHERE "key" = 'system.settings.roles.validation.idpRoleFormat';
UPDATE system.translations SET "key" = 'system.settings.roles.validation.idp_role_required' WHERE "key" = 'system.settings.roles.validation.idpRoleRequired';
UPDATE system.translations SET "key" = 'system.settings.security.change_password' WHERE "key" = 'system.settings.security.changePassword';
UPDATE system.translations SET "key" = 'system.settings.security.change_password_button' WHERE "key" = 'system.settings.security.changePasswordButton';
UPDATE system.translations SET "key" = 'system.settings.security.changing_password' WHERE "key" = 'system.settings.security.changingPassword';
UPDATE system.translations SET "key" = 'system.settings.security.confirm_delete_account' WHERE "key" = 'system.settings.security.confirmDeleteAccount';
UPDATE system.translations SET "key" = 'system.settings.security.confirm_password' WHERE "key" = 'system.settings.security.confirmPassword';
UPDATE system.translations SET "key" = 'system.settings.security.confirm_password_placeholder' WHERE "key" = 'system.settings.security.confirmPasswordPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.security.current_password' WHERE "key" = 'system.settings.security.currentPassword';
UPDATE system.translations SET "key" = 'system.settings.security.current_password_placeholder' WHERE "key" = 'system.settings.security.currentPasswordPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.security.delete_account' WHERE "key" = 'system.settings.security.deleteAccount';
UPDATE system.translations SET "key" = 'system.settings.security.delete_account_button' WHERE "key" = 'system.settings.security.deleteAccountButton';
UPDATE system.translations SET "key" = 'system.settings.security.delete_account_warning' WHERE "key" = 'system.settings.security.deleteAccountWarning';
UPDATE system.translations SET "key" = 'system.settings.security.new_password' WHERE "key" = 'system.settings.security.newPassword';
UPDATE system.translations SET "key" = 'system.settings.security.new_password_placeholder' WHERE "key" = 'system.settings.security.newPasswordPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.security.oidc_client_id' WHERE "key" = 'system.settings.security.oidcClientId';
UPDATE system.translations SET "key" = 'system.settings.security.oidc_client_secret' WHERE "key" = 'system.settings.security.oidcClientSecret';
UPDATE system.translations SET "key" = 'system.settings.security.oidc_issuer' WHERE "key" = 'system.settings.security.oidcIssuer';
UPDATE system.translations SET "key" = 'system.settings.security.oidc_params' WHERE "key" = 'system.settings.security.oidcParams';
UPDATE system.translations SET "key" = 'system.settings.security.oidc_save_button' WHERE "key" = 'system.settings.security.oidcSaveButton';
UPDATE system.translations SET "key" = 'system.settings.security.password_changed_error' WHERE "key" = 'system.settings.security.passwordChangedError';
UPDATE system.translations SET "key" = 'system.settings.security.password_changed_success' WHERE "key" = 'system.settings.security.passwordChangedSuccess';
UPDATE system.translations SET "key" = 'system.settings.security.passwords_do_not_match' WHERE "key" = 'system.settings.security.passwordsDoNotMatch';
UPDATE system.translations SET "key" = 'system.settings.templates.create_template' WHERE "key" = 'system.settings.templates.createTemplate';
UPDATE system.translations SET "key" = 'system.settings.templates.select_template_file' WHERE "key" = 'system.settings.templates.selectTemplateFile';
UPDATE system.translations SET "key" = 'system.settings.templates.templates_list' WHERE "key" = 'system.settings.templates.templatesList';
UPDATE system.translations SET "key" = 'system.settings.templates.upload_button' WHERE "key" = 'system.settings.templates.uploadButton';
UPDATE system.translations SET "key" = 'system.settings.templates.upload_template' WHERE "key" = 'system.settings.templates.uploadTemplate';
UPDATE system.translations SET "key" = 'system.settings.users.change_password' WHERE "key" = 'system.settings.users.changePassword';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_confirm' WHERE "key" = 'system.settings.users.changePasswordConfirm';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_confirm_placeholder' WHERE "key" = 'system.settings.users.changePasswordConfirmPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_description' WHERE "key" = 'system.settings.users.changePasswordDescription';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_failed' WHERE "key" = 'system.settings.users.changePasswordFailed';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_mismatch' WHERE "key" = 'system.settings.users.changePasswordMismatch';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_new' WHERE "key" = 'system.settings.users.changePasswordNew';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_new_placeholder' WHERE "key" = 'system.settings.users.changePasswordNewPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_success' WHERE "key" = 'system.settings.users.changePasswordSuccess';
UPDATE system.translations SET "key" = 'system.settings.users.change_password_title' WHERE "key" = 'system.settings.users.changePasswordTitle';
UPDATE system.translations SET "key" = 'system.settings.users.create.avatar_color' WHERE "key" = 'system.settings.users.create.avatarColor';
UPDATE system.translations SET "key" = 'system.settings.users.create.avatar_initials' WHERE "key" = 'system.settings.users.create.avatarInitials';
UPDATE system.translations SET "key" = 'system.settings.users.create.avatar_initials_placeholder' WHERE "key" = 'system.settings.users.create.avatarInitialsPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.copy_idp_code' WHERE "key" = 'system.settings.users.create.copyIdpCode';
UPDATE system.translations SET "key" = 'system.settings.users.create.copy_idp_username' WHERE "key" = 'system.settings.users.create.copyIdpUsername';
UPDATE system.translations SET "key" = 'system.settings.users.create.display_name' WHERE "key" = 'system.settings.users.create.displayName';
UPDATE system.translations SET "key" = 'system.settings.users.create.display_name_placeholder' WHERE "key" = 'system.settings.users.create.displayNamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.email_placeholder' WHERE "key" = 'system.settings.users.create.emailPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_active' WHERE "key" = 'system.settings.users.create.idpActive';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_admin' WHERE "key" = 'system.settings.users.create.idpAdmin';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_admin_hint' WHERE "key" = 'system.settings.users.create.idpAdminHint';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_code' WHERE "key" = 'system.settings.users.create.idpCode';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_email_verified' WHERE "key" = 'system.settings.users.create.idpEmailVerified';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_email_verified_hint' WHERE "key" = 'system.settings.users.create.idpEmailVerifiedHint';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_org' WHERE "key" = 'system.settings.users.create.idpOrg';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_org_placeholder' WHERE "key" = 'system.settings.users.create.idpOrgPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_org_search' WHERE "key" = 'system.settings.users.create.idpOrgSearch';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_password' WHERE "key" = 'system.settings.users.create.idpPassword';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_username' WHERE "key" = 'system.settings.users.create.idpUsername';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_verified' WHERE "key" = 'system.settings.users.create.idpVerified';
UPDATE system.translations SET "key" = 'system.settings.users.create.idp_verified_hint' WHERE "key" = 'system.settings.users.create.idpVerifiedHint';
UPDATE system.translations SET "key" = 'system.settings.users.create.invitation_sent' WHERE "key" = 'system.settings.users.create.invitationSent';
UPDATE system.translations SET "key" = 'system.settings.users.create.password_placeholder' WHERE "key" = 'system.settings.users.create.passwordPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.roles_placeholder' WHERE "key" = 'system.settings.users.create.rolesPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.send_invitation' WHERE "key" = 'system.settings.users.create.sendInvitation';
UPDATE system.translations SET "key" = 'system.settings.users.create.send_invitation_tooltip' WHERE "key" = 'system.settings.users.create.sendInvitationTooltip';
UPDATE system.translations SET "key" = 'system.settings.users.create.send_invitation_tooltip_title' WHERE "key" = 'system.settings.users.create.sendInvitationTooltipTitle';
UPDATE system.translations SET "key" = 'system.settings.users.create.unsaved_changes' WHERE "key" = 'system.settings.users.create.unsavedChanges';
UPDATE system.translations SET "key" = 'system.settings.users.create.username_disabled_placeholder' WHERE "key" = 'system.settings.users.create.usernameDisabledPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.username_placeholder' WHERE "key" = 'system.settings.users.create.usernamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.create.username_select_org_first' WHERE "key" = 'system.settings.users.create.usernameSelectOrgFirst';
UPDATE system.translations SET "key" = 'system.settings.users.update.avatar_color' WHERE "key" = 'system.settings.users.update.avatarColor';
UPDATE system.translations SET "key" = 'system.settings.users.update.avatar_initials' WHERE "key" = 'system.settings.users.update.avatarInitials';
UPDATE system.translations SET "key" = 'system.settings.users.update.avatar_initials_placeholder' WHERE "key" = 'system.settings.users.update.avatarInitialsPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.update.copy_idp_code' WHERE "key" = 'system.settings.users.update.copyIdpCode';
UPDATE system.translations SET "key" = 'system.settings.users.update.copy_idp_name' WHERE "key" = 'system.settings.users.update.copyIdpName';
UPDATE system.translations SET "key" = 'system.settings.users.update.copy_idp_owner' WHERE "key" = 'system.settings.users.update.copyIdpOwner';
UPDATE system.translations SET "key" = 'system.settings.users.update.display_name' WHERE "key" = 'system.settings.users.update.displayName';
UPDATE system.translations SET "key" = 'system.settings.users.update.display_name_placeholder' WHERE "key" = 'system.settings.users.update.displayNamePlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.update.email_placeholder' WHERE "key" = 'system.settings.users.update.emailPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.update.email_verified' WHERE "key" = 'system.settings.users.update.emailVerified';
UPDATE system.translations SET "key" = 'system.settings.users.update.idp_code' WHERE "key" = 'system.settings.users.update.idpCode';
UPDATE system.translations SET "key" = 'system.settings.users.update.idp_name' WHERE "key" = 'system.settings.users.update.idpName';
UPDATE system.translations SET "key" = 'system.settings.users.update.idp_org' WHERE "key" = 'system.settings.users.update.idpOrg';
UPDATE system.translations SET "key" = 'system.settings.users.update.idp_owner' WHERE "key" = 'system.settings.users.update.idpOwner';
UPDATE system.translations SET "key" = 'system.settings.users.update.idp_username' WHERE "key" = 'system.settings.users.update.idpUsername';
UPDATE system.translations SET "key" = 'system.settings.users.update.is_active' WHERE "key" = 'system.settings.users.update.isActive';
UPDATE system.translations SET "key" = 'system.settings.users.update.is_admin' WHERE "key" = 'system.settings.users.update.isAdmin';
UPDATE system.translations SET "key" = 'system.settings.users.update.is_verified' WHERE "key" = 'system.settings.users.update.isVerified';
UPDATE system.translations SET "key" = 'system.settings.users.update.roles_placeholder' WHERE "key" = 'system.settings.users.update.rolesPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.update.select_color_placeholder' WHERE "key" = 'system.settings.users.update.selectColorPlaceholder';
UPDATE system.translations SET "key" = 'system.settings.users.update.unsaved_changes' WHERE "key" = 'system.settings.users.update.unsavedChanges';
-- === repatriate foreign-ns rows (live + soft-deleted) ===
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.bcc', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.bcc'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.bcc';
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.cc', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.cc'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.cc';
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.language_iso', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.languageIso'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.languageIso';
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.template_code', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.templateCode'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.templateCode';
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.to', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.to'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.to';
INSERT INTO emailsender.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'emailsender.callable.send.variables', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'emailsender.callable.send.variables'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'emailsender.callable.send.variables';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.created_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.created_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.created_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.enabled', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.enabled'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.enabled';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.event_subject', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.event_subject'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.event_subject';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.execution_context', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.execution_context'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.execution_context';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.name', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.name'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.name';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.schedule_spec', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.schedule_spec'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.schedule_spec';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.target_subject', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.target_subject'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.target_subject';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.fields.updated_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.updated_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.fields.updated_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.plural', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.plural'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.plural';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.singular', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.singular'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.singular';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.status.system', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.status.system'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.status.system';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.status.user', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.status.user'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.status.user';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_rule.title', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_rule.title'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_rule.title';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.duration', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.duration'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.duration';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.error_code', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.error_code'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.error_code';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.error_detail', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.error_detail'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.error_detail';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.finished_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.finished_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.finished_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.job_name', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.job_name'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.job_name';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.redelivery', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.redelivery'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.redelivery';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.service_code', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.service_code'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.service_code';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.started_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.started_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.started_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.fields.status', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.fields.status'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.fields.status';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.plural', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.plural'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.plural';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.singular', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.singular'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.singular';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.status.dispatched', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.status.dispatched'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.status.dispatched';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.status.failed', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.status.failed'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.status.failed';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.status.skipped', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.status.skipped'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.status.skipped';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.status.succeeded', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.status.succeeded'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.status.succeeded';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_run.title', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_run.title'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_run.title';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.armed_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.armed_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.armed_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.job_name', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.job_name'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.job_name';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.kind', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.kind'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.kind';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.run_stats', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.run_stats'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.run_stats';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.schedule_spec', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.schedule_spec'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.schedule_spec';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.schedule_type', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.schedule_type'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.schedule_type';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.service_code', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.service_code'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.service_code';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.status', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.status'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.status';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.target_subject', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.target_subject'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.target_subject';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.fields.updated_at', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.updated_at'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.fields.updated_at';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.plural', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.plural'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.plural';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.singular', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.singular'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.singular';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.armed', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.armed'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.armed';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.disarmed', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.disarmed'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.disarmed';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.infra_derived', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.infra_derived'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.infra_derived';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.manual', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.manual'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.manual';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.once', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.once'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.once';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.recurring', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.recurring'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.recurring';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.status.rule', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.rule'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.status.rule';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.entities.job_schedule.title', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.entities.job_schedule.title'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.entities.job_schedule.title';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.nav', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.nav'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.nav';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.arm', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.arm'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.arm';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.desc', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.desc'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.desc';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.lane', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.lane'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.lane';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.name', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.name'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.name';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.preview', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.preview'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.preview';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.spec', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.spec'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.spec';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.target_action', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.targetAction'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.targetAction';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.target_service', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.targetService'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.targetService';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_dialog.title', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.title'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleDialog.title';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.schedule_new', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduleNew'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduleNew';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.scheduled_ok', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.scheduledOk'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.scheduledOk';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.sections.once', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.sections.once'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.sections.once';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.sections.recurring', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.sections.recurring'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.sections.recurring';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.sections.rules', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.sections.rules'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.sections.rules';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.sections.runs', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.sections.runs'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.sections.runs';
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'system.jobs.title', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM public.translations WHERE "key" = 'system.jobs.title'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM public.translations WHERE "key" = 'system.jobs.title';
INSERT INTO public.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'app.widgets.numeric_input.decrement', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM system.translations WHERE "key" = 'app.widgets.numeric_input.decrement'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM system.translations WHERE "key" = 'app.widgets.numeric_input.decrement';
INSERT INTO public.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by")
SELECT "uuid", 'app.widgets.numeric_input.increment', "language","value","created_at","created_by","updated_at","updated_by","version","deleted_at","deleted_by"
FROM system.translations WHERE "key" = 'app.widgets.numeric_input.increment'
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM system.translations WHERE "key" = 'app.widgets.numeric_input.increment';
-- === move ai.config.* -> system.settings.config.ai.* ===
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version")
SELECT "uuid", 'system.settings.config.ai.' || substring("key" from 11), "language","value","created_at",'migration-i18n-key-snake-cleanup',"updated_at",'migration-i18n-key-snake-cleanup',"version"
FROM ai.translations WHERE "key" LIKE 'ai.config.%' AND deleted_at IS NULL
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM ai.translations WHERE "key" LIKE 'ai.config.%' AND deleted_at IS NULL;
-- === move job.config.* -> system.settings.config.job.* ===
INSERT INTO system.translations ("uuid","key","language","value","created_at","created_by","updated_at","updated_by","version")
SELECT "uuid", 'system.settings.config.job.' || substring("key" from 12), "language","value","created_at",'migration-i18n-key-snake-cleanup',"updated_at",'migration-i18n-key-snake-cleanup',"version"
FROM job.translations WHERE "key" LIKE 'job.config.%' AND deleted_at IS NULL
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
DELETE FROM job.translations WHERE "key" LIKE 'job.config.%' AND deleted_at IS NULL;
-- === new system.settings.config.* vocabulary (20 params x 2 facets x 7 langs) ===
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.nats_url.label', 'en-GB', 'NATS URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'en-US', 'NATS URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'it-IT', 'URL NATS', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'fr-FR', 'URL NATS', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'es-ES', 'URL de NATS', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'de-DE', 'NATS-URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.label', 'pt-PT', 'URL NATS', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.nats_url.description', 'en-GB', 'Connection URL of the NATS message bus.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'en-US', 'Connection URL of the NATS message bus.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'it-IT', 'URL di connessione del bus messaggi NATS.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'fr-FR', 'URL de connexion du bus de messages NATS.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'es-ES', 'URL de conexión del bus de mensajes NATS.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'de-DE', 'Verbindungs-URL des NATS-Message-Bus.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.nats_url.description', 'pt-PT', 'URL de ligação ao bus de mensagens NATS.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.http_port.label', 'en-GB', 'HTTP port', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'en-US', 'HTTP port', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'it-IT', 'Porta HTTP', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'fr-FR', 'Port HTTP', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'es-ES', 'Puerto HTTP', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'de-DE', 'HTTP-Port', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.label', 'pt-PT', 'Porta HTTP', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.http_port.description', 'en-GB', 'Port this service listens on for HTTP requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'en-US', 'Port this service listens on for HTTP requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'it-IT', 'Porta su cui il servizio resta in ascolto per le richieste HTTP.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'fr-FR', 'Port sur lequel le service écoute les requêtes HTTP.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'es-ES', 'Puerto en el que el servicio escucha las solicitudes HTTP.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'de-DE', 'Port, auf dem der Service HTTP-Anfragen entgegennimmt.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.http_port.description', 'pt-PT', 'Porta onde o serviço escuta os pedidos HTTP.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.service_base_url.label', 'en-GB', 'Service base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'en-US', 'Service base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'it-IT', 'URL base servizio', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'fr-FR', 'URL de base du service', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'es-ES', 'URL base del servicio', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'de-DE', 'Service-Basis-URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.label', 'pt-PT', 'URL base do serviço', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.service_base_url.description', 'en-GB', 'Public base URL of this service.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'en-US', 'Public base URL of this service.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'it-IT', 'URL pubblico di base del servizio.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'fr-FR', 'URL de base publique du service.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'es-ES', 'URL base pública del servicio.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'de-DE', 'Öffentliche Basis-URL dieses Services.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_base_url.description', 'pt-PT', 'URL base pública deste serviço.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.be_base_url.label', 'en-GB', 'Backend base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'en-US', 'Backend base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'it-IT', 'URL base backend', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'fr-FR', 'URL de base du backend', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'es-ES', 'URL base del backend', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'de-DE', 'Backend-Basis-URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.label', 'pt-PT', 'URL base do backend', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.be_base_url.description', 'en-GB', 'Base URL of the Primebrick backend API.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'en-US', 'Base URL of the Primebrick backend API.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'it-IT', 'URL base dell''API backend Primebrick.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'fr-FR', 'URL de base de l''API backend Primebrick.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'es-ES', 'URL base de la API backend de Primebrick.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'de-DE', 'Basis-URL der Primebrick-Backend-API.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.be_base_url.description', 'pt-PT', 'URL base da API backend Primebrick.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.service_code.label', 'en-GB', 'Service code', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'en-US', 'Service code', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'it-IT', 'Codice servizio', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'fr-FR', 'Code du service', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'es-ES', 'Código de servicio', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'de-DE', 'Service-Code', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.label', 'pt-PT', 'Código do serviço', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.infra.service_code.description', 'en-GB', 'Unique code identifying this service in the registry.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'en-US', 'Unique code identifying this service in the registry.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'it-IT', 'Codice univoco che identifica il servizio nel registry.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'fr-FR', 'Code unique identifiant ce service dans le registre.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'es-ES', 'Código único que identifica el servicio en el registro.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'de-DE', 'Eindeutiger Code zur Identifikation dieses Services im Registry.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.infra.service_code.description', 'pt-PT', 'Código único que identifica o serviço no registo.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_key.label', 'en-GB', 'Client shield key', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'en-US', 'Client shield key', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'it-IT', 'Chiave client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'fr-FR', 'Clé client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'es-ES', 'Clave client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'de-DE', 'Client-Shield-Schlüssel', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.label', 'pt-PT', 'Chave client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_key.description', 'en-GB', 'API key this service presents to the client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'en-US', 'API key this service presents to the client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'it-IT', 'Chiave API che il servizio presenta al client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'fr-FR', 'Clé API que le service présente au client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'es-ES', 'Clave API que el servicio presenta al client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'de-DE', 'API-Schlüssel, den der Service dem Client Shield vorlegt.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_key.description', 'pt-PT', 'Chave API que o serviço apresenta ao client shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_secret.label', 'en-GB', 'Client shield secret', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'en-US', 'Client shield secret', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'it-IT', 'Segreto client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'fr-FR', 'Secret client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'es-ES', 'Secreto client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'de-DE', 'Client-Shield-Secret', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.label', 'pt-PT', 'Segredo client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_secret.description', 'en-GB', 'Shared secret used to sign client-shield requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'en-US', 'Shared secret used to sign client-shield requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'it-IT', 'Segreto condiviso per firmare le richieste client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'fr-FR', 'Secret partagé pour signer les requêtes client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'es-ES', 'Secreto compartido para firmar las solicitudes client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'de-DE', 'Gemeinsames Secret zum Signieren von Client-Shield-Anfragen.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret.description', 'pt-PT', 'Segredo partilhado para assinar pedidos client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'en-GB', 'Client shield secret header', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'en-US', 'Client shield secret header', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'it-IT', 'Header del segreto client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'fr-FR', 'En-tête du secret client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'es-ES', 'Cabecera del secreto client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'de-DE', 'Client-Shield-Secret-Header', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.label', 'pt-PT', 'Cabeçalho do segredo client shield', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'en-GB', 'HTTP header carrying the client-shield secret.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'en-US', 'HTTP header carrying the client-shield secret.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'it-IT', 'Header HTTP che trasporta il segreto client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'fr-FR', 'En-tête HTTP transportant le secret client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'es-ES', 'Cabecera HTTP que transporta el secreto client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'de-DE', 'HTTP-Header, der das Client-Shield-Secret trägt.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.auth.service_client_shield_secret_header.description', 'pt-PT', 'Cabeçalho HTTP que transporta o segredo client-shield.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_api_key.label', 'en-GB', 'LLM API key', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'en-US', 'LLM API key', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'it-IT', 'Chiave API LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'fr-FR', 'Clé API LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'es-ES', 'Clave API LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'de-DE', 'LLM-API-Schlüssel', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.label', 'pt-PT', 'Chave API LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_api_key.description', 'en-GB', 'API key for the LLM provider.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'en-US', 'API key for the LLM provider.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'it-IT', 'Chiave API del provider LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'fr-FR', 'Clé API du fournisseur LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'es-ES', 'Clave API del proveedor LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'de-DE', 'API-Schlüssel des LLM-Providers.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_api_key.description', 'pt-PT', 'Chave API do fornecedor LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_base_url.label', 'en-GB', 'LLM base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'en-US', 'LLM base URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'it-IT', 'URL base LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'fr-FR', 'URL de base LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'es-ES', 'URL base LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'de-DE', 'LLM-Basis-URL', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.label', 'pt-PT', 'URL base LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_base_url.description', 'en-GB', 'Base URL of the LLM provider endpoint.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'en-US', 'Base URL of the LLM provider endpoint.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'it-IT', 'URL base dell’endpoint del provider LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'fr-FR', 'URL de base du point de terminaison du fournisseur LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'es-ES', 'URL base del endpoint del proveedor LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'de-DE', 'Basis-URL des LLM-Provider-Endpunkts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_base_url.description', 'pt-PT', 'URL base do endpoint do fornecedor LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_model.label', 'en-GB', 'LLM model', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'en-US', 'LLM model', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'it-IT', 'Modello LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'fr-FR', 'Modèle LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'es-ES', 'Modelo LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'de-DE', 'LLM-Modell', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.label', 'pt-PT', 'Modelo LLM', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.llm_model.description', 'en-GB', 'Model identifier used for LLM completions.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'en-US', 'Model identifier used for LLM completions.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'it-IT', 'Identificativo del modello usato per le completion LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'fr-FR', 'Identifiant du modèle utilisé pour les complétions LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'es-ES', 'Identificador del modelo usado para las completaciones LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'de-DE', 'Modellkennung für LLM-Completions.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.llm_model.description', 'pt-PT', 'Identificador do modelo usado nas completions LLM.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_dim.label', 'en-GB', 'Embedding dimensions', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'en-US', 'Embedding dimensions', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'it-IT', 'Dimensioni embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'fr-FR', 'Dimensions embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'es-ES', 'Dimensiones de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'de-DE', 'Embedding-Dimensionen', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.label', 'pt-PT', 'Dimensões de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_dim.description', 'en-GB', 'Vector dimension produced by the embedding model.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'en-US', 'Vector dimension produced by the embedding model.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'it-IT', 'Dimensione del vettore prodotto dal modello di embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'fr-FR', 'Dimension du vecteur produit par le modèle d’embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'es-ES', 'Dimensión del vector producido por el modelo de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'de-DE', 'Vektordimension des Embedding-Modells.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dim.description', 'pt-PT', 'Dimensão do vetor produzido pelo modelo de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_dtype.label', 'en-GB', 'Embedding dtype', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'en-US', 'Embedding dtype', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'it-IT', 'Dtype embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'fr-FR', 'Dtype embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'es-ES', 'Dtype de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'de-DE', 'Embedding-Dtype', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.label', 'pt-PT', 'Dtype de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_dtype.description', 'en-GB', 'Numeric precision of embedding vectors.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'en-US', 'Numeric precision of embedding vectors.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'it-IT', 'Precisione numerica dei vettori di embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'fr-FR', 'Précision numérique des vecteurs d’embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'es-ES', 'Precisión numérica de los vectores de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'de-DE', 'Numerische Präzision der Embedding-Vektoren.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_dtype.description', 'pt-PT', 'Precisão numérica dos vetores de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_local_only.label', 'en-GB', 'Local embeddings only', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'en-US', 'Local embeddings only', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'it-IT', 'Solo embedding locali', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'fr-FR', 'Embeddings locaux uniquement', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'es-ES', 'Solo embeddings locales', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'de-DE', 'Nur lokale Embeddings', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.label', 'pt-PT', 'Apenas embeddings locais', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_local_only.description', 'en-GB', 'Generate embeddings locally without external calls.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'en-US', 'Generate embeddings locally without external calls.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'it-IT', 'Genera gli embedding in locale senza chiamate esterne.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'fr-FR', 'Génère les embeddings localement sans appels externes.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'es-ES', 'Genera los embeddings localmente sin llamadas externas.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'de-DE', 'Embeddings lokal erzeugen, ohne externe Aufrufe.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_local_only.description', 'pt-PT', 'Gera embeddings localmente sem chamadas externas.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_model.label', 'en-GB', 'Embedding model', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'en-US', 'Embedding model', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'it-IT', 'Modello di embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'fr-FR', 'Modèle d’embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'es-ES', 'Modelo de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'de-DE', 'Embedding-Modell', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.label', 'pt-PT', 'Modelo de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_model.description', 'en-GB', 'Model used to generate embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'en-US', 'Model used to generate embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'it-IT', 'Modello usato per generare gli embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'fr-FR', 'Modèle utilisé pour générer les embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'es-ES', 'Modelo usado para generar los embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'de-DE', 'Modell zur Erzeugung der Embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_model.description', 'pt-PT', 'Modelo usado para gerar os embeddings.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_provider.label', 'en-GB', 'Embedding provider', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'en-US', 'Embedding provider', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'it-IT', 'Provider di embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'fr-FR', 'Fournisseur d’embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'es-ES', 'Proveedor de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'de-DE', 'Embedding-Provider', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.label', 'pt-PT', 'Fornecedor de embedding', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.embedding_provider.description', 'en-GB', 'Provider that serves the embedding model.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'en-US', 'Provider that serves the embedding model.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'it-IT', 'Provider che eroga il modello di embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'fr-FR', 'Fournisseur servant le modèle d’embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'es-ES', 'Proveedor que sirve el modelo de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'de-DE', 'Provider, der das Embedding-Modell bereitstellt.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.embedding_provider.description', 'pt-PT', 'Fornecedor que serve o modelo de embedding.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_capacity.label', 'en-GB', 'Rate limit capacity', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'en-US', 'Rate limit capacity', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'it-IT', 'Capacità rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'fr-FR', 'Capacité rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'es-ES', 'Capacidad rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'de-DE', 'Rate-Limit-Kapazität', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.label', 'pt-PT', 'Capacidade rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_capacity.description', 'en-GB', 'Maximum burst of allowed LLM requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'en-US', 'Maximum burst of allowed LLM requests.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'it-IT', 'Numero massimo di richieste LLM ammesse in burst.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'fr-FR', 'Rafale maximale de requêtes LLM autorisées.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'es-ES', 'Ráfaga máxima de solicitudes LLM permitidas.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'de-DE', 'Maximaler Burst erlaubter LLM-Anfragen.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_capacity.description', 'pt-PT', 'Rajada máxima de pedidos LLM permitidos.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'en-GB', 'Rate limit refill', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'en-US', 'Rate limit refill', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'it-IT', 'Ricarica rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'fr-FR', 'Recharge rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'es-ES', 'Recarga rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'de-DE', 'Rate-Limit-Nachfüllrate', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.label', 'pt-PT', 'Recarga rate limit', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'en-GB', 'Requests refilled per second.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'en-US', 'Requests refilled per second.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'it-IT', 'Richieste ricaricate al secondo.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'fr-FR', 'Requêtes rechargées par seconde.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'es-ES', 'Solicitudes recargadas por segundo.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'de-DE', 'Pro Sekunde nachgefüllte Anfragen.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_refill_rate.description', 'pt-PT', 'Pedidos recarregados por segundo.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_token_cost.label', 'en-GB', 'Token cost', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'en-US', 'Token cost', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'it-IT', 'Costo token', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'fr-FR', 'Coût en tokens', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'es-ES', 'Coste en tokens', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'de-DE', 'Token-Kosten', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.label', 'pt-PT', 'Custo em tokens', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.rate_limit_token_cost.description', 'en-GB', 'Tokens charged per request.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'en-US', 'Tokens charged per request.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'it-IT', 'Token addebitati per richiesta.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'fr-FR', 'Tokens facturés par requête.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'es-ES', 'Tokens cobrados por solicitud.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'de-DE', 'Pro Anfrage berechnete Tokens.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.rate_limit_token_cost.description', 'pt-PT', 'Tokens cobrados por pedido.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.redact_pii.label', 'en-GB', 'Redact PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'en-US', 'Redact PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'it-IT', 'Oscura PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'fr-FR', 'Masquer les PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'es-ES', 'Ocultar PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'de-DE', 'PII schwärzen', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.label', 'pt-PT', 'Ocultar PII', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
INSERT INTO system.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('system.settings.config.ai.redact_pii.description', 'en-GB', 'Strip personally identifiable information before sending prompts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'en-US', 'Strip personally identifiable information before sending prompts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'it-IT', 'Rimuovi le informazioni personali prima di inviare i prompt.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'fr-FR', 'Supprime les informations personnelles avant l’envoi des prompts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'es-ES', 'Elimina la información personal antes de enviar los prompts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'de-DE', 'Personenbezogene Daten vor dem Senden der Prompts entfernen.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('system.settings.config.ai.redact_pii.description', 'pt-PT', 'Remove informação pessoal antes de enviar os prompts.', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
-- === config_entries referrer rewrites (config.* -> system.settings.config.<grp>.*) ===
UPDATE public.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_key.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f539387d-4107-4bf9-ad0b-d1ef81ae6670';
UPDATE public.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_key.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f539387d-4107-4bf9-ad0b-d1ef81ae6670';
UPDATE public.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'b54fba59-266e-4ac5-8c83-0fe472e392bd' AND label_key = 'system.settings.config.auth.gateway_secret_header.label';
UPDATE public.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'b54fba59-266e-4ac5-8c83-0fe472e392bd' AND description_key = 'system.settings.config.auth.gateway_secret_header.description';
UPDATE public.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e457b371-dbd7-41a6-956b-cd676b41e795' AND label_key = 'config.service_client_shield_secret.label';
UPDATE public.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e457b371-dbd7-41a6-956b-cd676b41e795' AND description_key = 'config.service_client_shield_secret.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.infra.nats_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4e434e8a-9475-45b0-81b0-2751ae9d9112' AND label_key = 'config.nats_url.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.infra.nats_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4e434e8a-9475-45b0-81b0-2751ae9d9112' AND description_key = 'config.nats_url.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.infra.service_code.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cc9b06e9-8bf3-4224-aa2a-a046aa31733d' AND label_key = 'config.service_code.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.infra.service_code.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cc9b06e9-8bf3-4224-aa2a-a046aa31733d' AND description_key = 'config.service_code.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.infra.http_port.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '11e1ca19-f047-4e50-9ce6-0f7e31f0bcf4' AND label_key = 'config.http_port.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.infra.http_port.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '11e1ca19-f047-4e50-9ce6-0f7e31f0bcf4' AND description_key = 'config.http_port.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.infra.service_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd50529c0-6ceb-433d-afc2-5bc769c4b4f1' AND label_key = 'config.service_base_url.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.infra.service_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd50529c0-6ceb-433d-afc2-5bc769c4b4f1' AND description_key = 'config.service_base_url.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.infra.be_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '65a1b5aa-f545-44b9-acc9-92e8aa8c8dfb' AND label_key = 'config.be_base_url.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.infra.be_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '65a1b5aa-f545-44b9-acc9-92e8aa8c8dfb' AND description_key = 'config.be_base_url.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.auth.auth_mode.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2a196360-4e7c-4d26-9d53-ccd1158030a3' AND label_key = 'config.auth_mode.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.auth.auth_mode.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2a196360-4e7c-4d26-9d53-ccd1158030a3' AND description_key = 'config.auth_mode.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.auth.auth_roles_path.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f695c4db-47f3-46be-b0bc-3fcb1291ea0d' AND label_key = 'config.auth_roles_path.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.auth.auth_roles_path.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f695c4db-47f3-46be-b0bc-3fcb1291ea0d' AND description_key = 'config.auth_roles_path.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_key.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0a9d5d5c-610f-4ae8-b19a-50883f8d5fe5' AND label_key = 'config.service_client_shield_key.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_key.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0a9d5d5c-610f-4ae8-b19a-50883f8d5fe5' AND description_key = 'config.service_client_shield_key.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '78aabcec-6374-48f8-987b-9b50e2bd97e1' AND label_key = 'config.service_client_shield_secret.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '78aabcec-6374-48f8-987b-9b50e2bd97e1' AND description_key = 'config.service_client_shield_secret.description';
UPDATE crm.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '8c160ba7-4c74-4fdc-a4a0-c807361fad0c' AND label_key = 'config.service_client_shield_secret_header.label';
UPDATE crm.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '8c160ba7-4c74-4fdc-a4a0-c807361fad0c' AND description_key = 'config.service_client_shield_secret_header.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.infra.nats_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'aaecfb50-0aae-43a3-af6e-9afe8a848f3e' AND label_key = 'config.nats_url.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.infra.nats_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'aaecfb50-0aae-43a3-af6e-9afe8a848f3e' AND description_key = 'config.nats_url.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.infra.http_port.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cfc8d498-e06f-4cb0-9d82-229aeaaccd0f' AND label_key = 'config.http_port.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.infra.http_port.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cfc8d498-e06f-4cb0-9d82-229aeaaccd0f' AND description_key = 'config.http_port.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.auth.auth_mode.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4456a51c-8d6c-4335-bb9b-5822bd831d43' AND label_key = 'config.auth_mode.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.auth.auth_mode.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4456a51c-8d6c-4335-bb9b-5822bd831d43' AND description_key = 'config.auth_mode.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.auth.auth_roles_path.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '59e681f2-ce08-4da9-9a91-dfb88b1a860d' AND label_key = 'config.auth_roles_path.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.auth.auth_roles_path.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '59e681f2-ce08-4da9-9a91-dfb88b1a860d' AND description_key = 'config.auth_roles_path.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.infra.service_code.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '04bfee29-6715-4334-8d55-a2d9e2cc61bd' AND label_key = 'config.service_code.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.infra.service_code.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '04bfee29-6715-4334-8d55-a2d9e2cc61bd' AND description_key = 'config.service_code.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.infra.service_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '5626f1d3-232c-430d-8146-b702c6751a68' AND label_key = 'config.service_base_url.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.infra.service_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '5626f1d3-232c-430d-8146-b702c6751a68' AND description_key = 'config.service_base_url.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f1b949cf-1799-4c31-820c-e19e7925d37b' AND label_key = 'config.service_client_shield_secret.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f1b949cf-1799-4c31-820c-e19e7925d37b' AND description_key = 'config.service_client_shield_secret.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.llm_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e72301fa-bb1c-445d-8e76-6ba33ef8f40b' AND label_key = 'config.llm_base_url.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.llm_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e72301fa-bb1c-445d-8e76-6ba33ef8f40b' AND description_key = 'config.llm_base_url.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.llm_model.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'eacbc747-c72f-4f4b-8219-084521386c70' AND label_key = 'config.llm_model.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.llm_model.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'eacbc747-c72f-4f4b-8219-084521386c70' AND description_key = 'config.llm_model.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.llm_api_key.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2550e639-60ff-430e-acd6-d4b8b3066e58' AND label_key = 'config.llm_api_key.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.llm_api_key.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2550e639-60ff-430e-acd6-d4b8b3066e58' AND description_key = 'config.llm_api_key.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.embedding_provider.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '411b2a45-d0e1-4910-a01f-029991635a8c' AND label_key = 'config.embedding_provider.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.embedding_provider.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '411b2a45-d0e1-4910-a01f-029991635a8c' AND description_key = 'config.embedding_provider.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.embedding_model.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '1e8b3362-532f-47d8-b3ad-acecc7856e74' AND label_key = 'config.embedding_model.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.embedding_model.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '1e8b3362-532f-47d8-b3ad-acecc7856e74' AND description_key = 'config.embedding_model.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.embedding_dim.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '21615703-a56b-440f-aa1f-28750f763365' AND label_key = 'config.embedding_dim.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.embedding_dim.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '21615703-a56b-440f-aa1f-28750f763365' AND description_key = 'config.embedding_dim.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.embedding_dtype.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '3f274a8b-0dba-4959-ae61-bfc0766acdd9' AND label_key = 'config.embedding_dtype.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.embedding_dtype.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '3f274a8b-0dba-4959-ae61-bfc0766acdd9' AND description_key = 'config.embedding_dtype.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.embedding_local_only.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9402b0e8-c3e9-43ff-804c-40b15078f9c1' AND label_key = 'config.embedding_local_only.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.embedding_local_only.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9402b0e8-c3e9-43ff-804c-40b15078f9c1' AND description_key = 'config.embedding_local_only.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.redact_pii.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'a75f2496-b4ba-4cad-8e9d-2234a4a80ed0' AND label_key = 'config.redact_pii.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.redact_pii.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'a75f2496-b4ba-4cad-8e9d-2234a4a80ed0' AND description_key = 'config.redact_pii.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.rate_limit_capacity.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9bc5d737-33c2-4aa0-aa18-df2bae42a7bd' AND label_key = 'config.rate_limit_capacity.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.rate_limit_capacity.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9bc5d737-33c2-4aa0-aa18-df2bae42a7bd' AND description_key = 'config.rate_limit_capacity.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.rate_limit_refill_rate.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '925f1059-1f7d-483d-bc44-10e3a747ad61' AND label_key = 'config.rate_limit_refill_rate.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.rate_limit_refill_rate.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '925f1059-1f7d-483d-bc44-10e3a747ad61' AND description_key = 'config.rate_limit_refill_rate.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.rate_limit_token_cost.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2ae3b7c9-e22d-4b0a-a84f-5b350f821a5b' AND label_key = 'config.rate_limit_token_cost.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.rate_limit_token_cost.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '2ae3b7c9-e22d-4b0a-a84f-5b350f821a5b' AND description_key = 'config.rate_limit_token_cost.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0357f76f-ed79-4706-b950-a0142f892ab8' AND label_key = 'config.gateway_secret_header.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0357f76f-ed79-4706-b950-a0142f892ab8' AND description_key = 'config.gateway_secret_header.description';
UPDATE ai.config_entries SET label_key = 'system.settings.config.ai.ai_assistant_model.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4bf9905a-67ef-42cd-a0b3-f0150e5670c6' AND label_key = 'ai.config.ai_assistant_model.label';
UPDATE ai.config_entries SET description_key = 'system.settings.config.ai.ai_assistant_model.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4bf9905a-67ef-42cd-a0b3-f0150e5670c6' AND description_key = 'ai.config.ai_assistant_model.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.infra.nats_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'fdf24b8e-7de3-4f5a-a81d-23908dbf3c2a' AND label_key = 'config.nats_url.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.infra.nats_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'fdf24b8e-7de3-4f5a-a81d-23908dbf3c2a' AND description_key = 'config.nats_url.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.infra.service_code.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4bde64ec-7a35-4a26-8818-36ee0d0ab3c5' AND label_key = 'config.service_code.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.infra.service_code.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4bde64ec-7a35-4a26-8818-36ee0d0ab3c5' AND description_key = 'config.service_code.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.infra.http_port.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '8f73ca5f-56d8-4153-a277-9b914b69d935' AND label_key = 'config.http_port.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.infra.http_port.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '8f73ca5f-56d8-4153-a277-9b914b69d935' AND description_key = 'config.http_port.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.infra.service_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'da9d2d10-fb9f-45f5-a717-2e51d4effa77' AND label_key = 'config.service_base_url.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.infra.service_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'da9d2d10-fb9f-45f5-a717-2e51d4effa77' AND description_key = 'config.service_base_url.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.infra.be_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4cb2cc1a-7801-4fbe-970e-350469f745a3' AND label_key = 'config.be_base_url.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.infra.be_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '4cb2cc1a-7801-4fbe-970e-350469f745a3' AND description_key = 'config.be_base_url.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.auth.auth_mode.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cd9945c0-d986-43c3-900f-48433c556c36' AND label_key = 'config.auth_mode.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.auth.auth_mode.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cd9945c0-d986-43c3-900f-48433c556c36' AND description_key = 'config.auth_mode.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.auth.auth_roles_path.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9f23118f-e379-4fe4-82f1-034b5c1029d4' AND label_key = 'config.auth_roles_path.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.auth.auth_roles_path.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9f23118f-e379-4fe4-82f1-034b5c1029d4' AND description_key = 'config.auth_roles_path.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_key.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f5e24aa3-bfcb-4c1b-a8d8-3018c5979d26' AND label_key = 'config.service_client_shield_key.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_key.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'f5e24aa3-bfcb-4c1b-a8d8-3018c5979d26' AND description_key = 'config.service_client_shield_key.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd5ff9fa3-e31a-4d21-b9da-2a51f9521f80' AND label_key = 'config.service_client_shield_secret.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd5ff9fa3-e31a-4d21-b9da-2a51f9521f80' AND description_key = 'config.service_client_shield_secret.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd052274d-7ea8-4b7b-a5aa-56bec67a4464' AND label_key = 'config.service_client_shield_secret_header.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd052274d-7ea8-4b7b-a5aa-56bec67a4464' AND description_key = 'config.service_client_shield_secret_header.description';
UPDATE job.config_entries SET label_key = 'system.settings.config.job.reconcile_interval_ms.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0cac1b65-3f67-4970-baff-2b01dd7637d8' AND label_key = 'job.config.reconcile_interval_ms.label';
UPDATE job.config_entries SET description_key = 'system.settings.config.job.reconcile_interval_ms.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0cac1b65-3f67-4970-baff-2b01dd7637d8' AND description_key = 'job.config.reconcile_interval_ms.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.infra.be_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '53273f9d-af2d-4413-b8d6-6ac7ac6e66a5' AND label_key = 'config.be_base_url.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.infra.be_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '53273f9d-af2d-4413-b8d6-6ac7ac6e66a5' AND description_key = 'config.be_base_url.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.infra.nats_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cab466ff-1e12-4e5f-ac95-75ec32eb6a8f' AND label_key = 'config.nats_url.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.infra.nats_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'cab466ff-1e12-4e5f-ac95-75ec32eb6a8f' AND description_key = 'config.nats_url.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.infra.service_code.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e4588bd0-ec5a-4176-a115-2df74b4a0d03' AND label_key = 'config.service_code.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.infra.service_code.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e4588bd0-ec5a-4176-a115-2df74b4a0d03' AND description_key = 'config.service_code.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.infra.http_port.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '77965eac-2662-43d1-be43-cc01a50f355c' AND label_key = 'config.http_port.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.infra.http_port.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '77965eac-2662-43d1-be43-cc01a50f355c' AND description_key = 'config.http_port.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.infra.service_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e7837c4d-4fc5-4120-8b9b-0af970af3373' AND label_key = 'config.service_base_url.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.infra.service_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e7837c4d-4fc5-4120-8b9b-0af970af3373' AND description_key = 'config.service_base_url.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '648a8068-a199-422f-a97c-ef0ef81a784b' AND label_key = 'config.gateway_secret_header.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '648a8068-a199-422f-a97c-ef0ef81a784b' AND description_key = 'config.gateway_secret_header.description';
UPDATE emailsender.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '5a277986-c146-4e63-b9ce-781282906ec9' AND label_key = 'config.service_client_shield_secret.label';
UPDATE emailsender.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '5a277986-c146-4e63-b9ce-781282906ec9' AND description_key = 'config.service_client_shield_secret.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.infra.nats_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e6a368d6-5df9-46b9-b022-86d55a9c735f' AND label_key = 'config.nats_url.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.infra.nats_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'e6a368d6-5df9-46b9-b022-86d55a9c735f' AND description_key = 'config.nats_url.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.infra.service_code.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0d6c1758-9712-4730-a108-76b58ee925cf' AND label_key = 'config.service_code.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.infra.service_code.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '0d6c1758-9712-4730-a108-76b58ee925cf' AND description_key = 'config.service_code.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.infra.http_port.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '6925cd2f-c7d6-44f9-99aa-1357cb7cde57' AND label_key = 'config.http_port.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.infra.http_port.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '6925cd2f-c7d6-44f9-99aa-1357cb7cde57' AND description_key = 'config.http_port.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_key.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'af6281fa-2b0f-4b09-bffc-3242320bb280' AND label_key = 'config.client_key.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_key.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'af6281fa-2b0f-4b09-bffc-3242320bb280' AND description_key = 'config.client_key.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.infra.be_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd31ccf02-9487-4d41-a587-863800a21f29' AND label_key = 'config.be_base_url.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.infra.be_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'd31ccf02-9487-4d41-a587-863800a21f29' AND description_key = 'config.be_base_url.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.infra.service_base_url.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '07c69f19-6382-49e3-8088-337e624addcd' AND label_key = 'config.service_base_url.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.infra.service_base_url.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '07c69f19-6382-49e3-8088-337e624addcd' AND description_key = 'config.service_base_url.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret_header.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'c8ef4087-a62d-43f7-88f9-72910f3b1fd0' AND label_key = 'config.gateway_secret_header.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret_header.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'c8ef4087-a62d-43f7-88f9-72910f3b1fd0' AND description_key = 'config.gateway_secret_header.description';
UPDATE webhook.config_entries SET label_key = 'system.settings.config.auth.service_client_shield_secret.label', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'b60bdde3-8412-4cef-ae05-a6f73efc55a7' AND label_key = 'config.service_client_shield_secret.label';
UPDATE webhook.config_entries SET description_key = 'system.settings.config.auth.service_client_shield_secret.description', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = 'b60bdde3-8412-4cef-ae05-a6f73efc55a7' AND description_key = 'config.service_client_shield_secret.description';
-- === type_config embedded key renames ===
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.aria"', '"app.ai_chat.aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.aria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.conversations"', '"app.ai_chat.conversations"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.conversations"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.empty"', '"app.ai_chat.empty"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.empty"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.error"', '"app.ai_chat.error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.error"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.loading"', '"app.ai_chat.loading"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.loading"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.navigateConfirm"', '"app.ai_chat.navigate_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.navigateConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.newConversation"', '"app.ai_chat.new_conversation"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.newConversation"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.no"', '"app.ai_chat.no"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.no"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.placeholder"', '"app.ai_chat.placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.placeholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.rateLimited"', '"app.ai_chat.rate_limited"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.rateLimited"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.send"', '"app.ai_chat.send"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.send"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.stop"', '"app.ai_chat.stop"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.stop"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.title"', '"app.ai_chat.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.toolCall"', '"app.ai_chat.tool_call"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.toolCall"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.toolCallConfirm"', '"app.ai_chat.tool_call_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.toolCallConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.welcome"', '"app.ai_chat.welcome"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.welcome"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiChat.yes"', '"app.ai_chat.yes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiChat.yes"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.aiGuide.aria"', '"app.ai_guide.aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.aiGuide.aria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.backToMethods"', '"app.auth.auth_method_enforcer.back_to_methods"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.backToMethods"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.benefitConvenienceMfa"', '"app.auth.auth_method_enforcer.benefit_convenience_mfa"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.benefitConvenienceMfa"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.benefitConveniencePasskey"', '"app.auth.auth_method_enforcer.benefit_convenience_passkey"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.benefitConveniencePasskey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.benefitSecurity"', '"app.auth.auth_method_enforcer.benefit_security"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.benefitSecurity"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.description"', '"app.auth.auth_method_enforcer.description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.description"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.dismissButton"', '"app.auth.auth_method_enforcer.dismiss_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.dismissButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.dontAskAgain"', '"app.auth.auth_method_enforcer.dont_ask_again"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.dontAskAgain"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.enrollMfaButton"', '"app.auth.auth_method_enforcer.enroll_mfa_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.enrollMfaButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.enrollPasskeyButton"', '"app.auth.auth_method_enforcer.enroll_passkey_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.enrollPasskeyButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.enrolling"', '"app.auth.auth_method_enforcer.enrolling"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.enrolling"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.methodMfa"', '"app.auth.auth_method_enforcer.method_mfa"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.methodMfa"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.methodMfaDesc"', '"app.auth.auth_method_enforcer.method_mfa_desc"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.methodMfaDesc"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.methodPasskey"', '"app.auth.auth_method_enforcer.method_passkey"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.methodPasskey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.methodPasskeyDesc"', '"app.auth.auth_method_enforcer.method_passkey_desc"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.methodPasskeyDesc"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.title"', '"app.auth.auth_method_enforcer.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.authMethodEnforcer.warningMfa"', '"app.auth.auth_method_enforcer.warning_mfa"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.authMethodEnforcer.warningMfa"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.accountLocked"', '"app.auth.login.account_locked"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.accountLocked"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.buttonLoading"', '"app.auth.login.button_loading"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.buttonLoading"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.invalidCredentials"', '"app.auth.login.invalid_credentials"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.invalidCredentials"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.mfa.challengeExpired"', '"app.auth.login.mfa.challenge_expired"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.mfa.challengeExpired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.mfa.codeRequired"', '"app.auth.login.mfa.code_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.mfa.codeRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.mfa.connectionError"', '"app.auth.login.mfa.connection_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.mfa.connectionError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.mfa.factorLabel"', '"app.auth.login.mfa.factor_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.mfa.factorLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.mfa.invalidCode"', '"app.auth.login.mfa.invalid_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.mfa.invalidCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.passkey.credentialNotFound"', '"app.auth.login.passkey.credential_not_found"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.passkey.credentialNotFound"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.passkey.sessionExpired"', '"app.auth.login.passkey.session_expired"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.passkey.sessionExpired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.passwordPlaceholder"', '"app.auth.login.password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.passwordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.userNoPermission"', '"app.auth.login.user_no_permission"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.userNoPermission"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.login.usernamePlaceholder"', '"app.auth.login.username_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.login.usernamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.codeRequired"', '"app.auth.mfa.code_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.codeRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.connectionError"', '"app.auth.mfa.connection_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.connectionError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.defaultLabel"', '"app.auth.mfa.default_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.defaultLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.deleteDialogDescription"', '"app.auth.mfa.delete_dialog_description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.deleteDialogDescription"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.deleteDialogTitle"', '"app.auth.mfa.delete_dialog_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.deleteDialogTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.deleteError"', '"app.auth.mfa.delete_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.deleteError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.deleteSuccess"', '"app.auth.mfa.delete_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.deleteSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.disabledHint"', '"app.auth.mfa.disabled_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.disabledHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.disabledTitle"', '"app.auth.mfa.disabled_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.disabledTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.emptyHint"', '"app.auth.mfa.empty_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.emptyHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.emptyTitle"', '"app.auth.mfa.empty_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.emptyTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollAnother"', '"app.auth.mfa.enroll_another"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollAnother"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollButton"', '"app.auth.mfa.enroll_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollDialogTitle"', '"app.auth.mfa.enroll_dialog_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollDialogTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollStepQr"', '"app.auth.mfa.enroll_step_qr"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollStepQr"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollStepVerify"', '"app.auth.mfa.enroll_step_verify"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollStepVerify"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollmentError"', '"app.auth.mfa.enrollment_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollmentError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.enrollmentSuccess"', '"app.auth.mfa.enrollment_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.enrollmentSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.factorType"', '"app.auth.mfa.factor_type"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.factorType"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.invalidCode"', '"app.auth.mfa.invalid_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.invalidCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.labelPlaceholder"', '"app.auth.mfa.label_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.labelPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.lastUsed"', '"app.auth.mfa.last_used"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.lastUsed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.loadingHint"', '"app.auth.mfa.loading_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.loadingHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.loadingTitle"', '"app.auth.mfa.loading_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.loadingTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.manualEntry"', '"app.auth.mfa.manual_entry"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.manualEntry"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.recoveryCodes"', '"app.auth.mfa.recovery_codes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.recoveryCodes"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.recoveryCodesWarning"', '"app.auth.mfa.recovery_codes_warning"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.recoveryCodesWarning"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.verifyAndEnable"', '"app.auth.mfa.verify_and_enable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.verifyAndEnable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfa.verifyCode"', '"app.auth.mfa.verify_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfa.verifyCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.selectFactor"', '"app.auth.mfa_step_up.select_factor"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.selectFactor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.stepUpAction"', '"app.auth.mfa_step_up.step_up_action"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.stepUpAction"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.stepUpAuthorized"', '"app.auth.mfa_step_up.step_up_authorized"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.stepUpAuthorized"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.stepUpDescription"', '"app.auth.mfa_step_up.step_up_description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.stepUpDescription"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.stepUpInitiateError"', '"app.auth.mfa_step_up.step_up_initiate_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.stepUpInitiateError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.stepUpTitle"', '"app.auth.mfa_step_up.step_up_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.stepUpTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.mfaStepUp.verifyAndAuthorize"', '"app.auth.mfa_step_up.verify_and_authorize"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.mfaStepUp.verifyAndAuthorize"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.alreadyEnrolled"', '"app.auth.passkeys.already_enrolled"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.alreadyEnrolled"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.deleteError"', '"app.auth.passkeys.delete_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.deleteError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.emptyHint"', '"app.auth.passkeys.empty_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.emptyHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.emptyTitle"', '"app.auth.passkeys.empty_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.emptyTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.enrolledOn"', '"app.auth.passkeys.enrolled_on"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.enrolledOn"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.enrollmentError"', '"app.auth.passkeys.enrollment_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.enrollmentError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.enrollmentSuccess"', '"app.auth.passkeys.enrollment_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.enrollmentSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.lastUsed"', '"app.auth.passkeys.last_used"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.lastUsed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.loadingHint"', '"app.auth.passkeys.loading_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.loadingHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.loadingTitle"', '"app.auth.passkeys.loading_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.loadingTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.neverUsed"', '"app.auth.passkeys.never_used"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.neverUsed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.notSupported"', '"app.auth.passkeys.not_supported"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.notSupported"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.unknownDevice"', '"app.auth.passkeys.unknown_device"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.unknownDevice"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.passkeys.unknownPasskey"', '"app.auth.passkeys.unknown_passkey"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.passkeys.unknownPasskey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.roles.notValidRole"', '"app.auth.roles.not_valid_role"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.roles.notValidRole"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.roles.systemAdministrator"', '"app.auth.roles.system_administrator"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.roles.systemAdministrator"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.sessionExpired.description"', '"app.auth.session_expired.description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.sessionExpired.description"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.sessionExpired.failedAttempt"', '"app.auth.session_expired.failed_attempt"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.sessionExpired.failedAttempt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.sessionExpired.goToLogin"', '"app.auth.session_expired.go_to_login"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.sessionExpired.goToLogin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.sessionExpired.title"', '"app.auth.session_expired.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.sessionExpired.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.complete.loginButton"', '"app.auth.welcome.complete.login_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.complete.loginButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.backToLogin"', '"app.auth.welcome.error.back_to_login"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.backToLogin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.completeFailed"', '"app.auth.welcome.error.complete_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.completeFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.invalidToken"', '"app.auth.welcome.error.invalid_token"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.invalidToken"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.networkError"', '"app.auth.welcome.error.network_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.networkError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.noToken"', '"app.auth.welcome.error.no_token"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.noToken"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.otpInvalid"', '"app.auth.welcome.error.otp_invalid"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.otpInvalid"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.error.otpSendFailed"', '"app.auth.welcome.error.otp_send_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.error.otpSendFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.otp.codeLabel"', '"app.auth.welcome.otp.code_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.otp.codeLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.otp.resendButton"', '"app.auth.welcome.otp.resend_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.otp.resendButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.otp.resendIn"', '"app.auth.welcome.otp.resend_in"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.otp.resendIn"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.otp.verifyButton"', '"app.auth.welcome.otp.verify_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.otp.verifyButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.passkey.descriptionRequired"', '"app.auth.welcome.passkey.description_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.passkey.descriptionRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.passkey.enrollButton"', '"app.auth.welcome.passkey.enroll_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.passkey.enrollButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.passkey.titleRequired"', '"app.auth.welcome.passkey.title_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.passkey.titleRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.completeButton"', '"app.auth.welcome.set_password.complete_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.completeButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.completing"', '"app.auth.welcome.set_password.completing"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.completing"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.confirmPasswordLabel"', '"app.auth.welcome.set_password.confirm_password_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.confirmPasswordLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.confirmPasswordPlaceholder"', '"app.auth.welcome.set_password.confirm_password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.confirmPasswordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.description"', '"app.auth.welcome.set_password.description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.description"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.newPasswordLabel"', '"app.auth.welcome.set_password.new_password_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.newPasswordLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.newPasswordPlaceholder"', '"app.auth.welcome.set_password.new_password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.newPasswordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.passwordsDoNotMatch"', '"app.auth.welcome.set_password.passwords_do_not_match"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.passwordsDoNotMatch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.auth.welcome.setPassword.title"', '"app.auth.welcome.set_password.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.auth.welcome.setPassword.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.description"', '"app.command_palette.description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.description"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.empty"', '"app.command_palette.empty"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.empty"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.groupSettings"', '"app.command_palette.group_settings"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.groupSettings"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.groupSuggestions"', '"app.command_palette.group_suggestions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.groupSuggestions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.inputPlaceholder"', '"app.command_palette.input_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.inputPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemBilling"', '"app.command_palette.item_billing"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemBilling"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemCalculator"', '"app.command_palette.item_calculator"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemCalculator"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemCalendar"', '"app.command_palette.item_calendar"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemCalendar"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemProfile"', '"app.command_palette.item_profile"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemProfile"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemSearchEmoji"', '"app.command_palette.item_search_emoji"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemSearchEmoji"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.itemSettings"', '"app.command_palette.item_settings"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.itemSettings"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.commandPalette.title"', '"app.command_palette.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.commandPalette.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.bulkRevert"', '"app.common.bulk_revert"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.bulkRevert"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.bulkScopeAllDesc"', '"app.common.bulk_scope_all_desc"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.bulkScopeAllDesc"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.bulkScopeAllTitle"', '"app.common.bulk_scope_all_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.bulkScopeAllTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.bulkScopeSelectedDesc"', '"app.common.bulk_scope_selected_desc"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.bulkScopeSelectedDesc"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.bulkScopeSelectedTitle"', '"app.common.bulk_scope_selected_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.bulkScopeSelectedTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.changesPending"', '"app.common.changes_pending"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.changesPending"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.clearAll"', '"app.common.clear_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.clearAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.clearSelection"', '"app.common.clear_selection"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.clearSelection"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.copyHtml"', '"app.common.copy_html"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.copyHtml"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.dbUnavailable"', '"app.common.db_unavailable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.dbUnavailable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteConfirm"', '"app.common.delete_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteConfirmTitle"', '"app.common.delete_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteEntitiesConfirm"', '"app.common.delete_entities_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteEntitiesConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteEntitiesTitle"', '"app.common.delete_entities_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteEntitiesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteEntityConfirm"', '"app.common.delete_entity_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteEntityConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteEntityTitle"', '"app.common.delete_entity_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteEntityTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteFailed"', '"app.common.delete_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deleteSuccess"', '"app.common.delete_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deleteSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deletedRecord"', '"app.common.deleted_record"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deletedRecord"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.deselectAll"', '"app.common.deselect_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.deselectAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.draftRestored"', '"app.common.draft_restored"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.draftRestored"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.draftRestoredTitle"', '"app.common.draft_restored_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.draftRestoredTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.duplicateConfirm"', '"app.common.duplicate_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.duplicateConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.duplicateConfirmSingle"', '"app.common.duplicate_confirm_single"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.duplicateConfirmSingle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.duplicateConfirmTitle"', '"app.common.duplicate_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.duplicateConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.enterValue"', '"app.common.enter_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.enterValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.notImplemented.detail"', '"app.common.errors.not_implemented.detail"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.notImplemented.detail"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.notImplemented.title"', '"app.common.errors.not_implemented.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.notImplemented.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.bulkDeleteApi"', '"app.common.errors.scope.bulk_delete_api"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.bulkDeleteApi"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.customerListApi"', '"app.common.errors.scope.customer_list_api"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.customerListApi"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.customersList"', '"app.common.errors.scope.customers_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.customersList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.customersPageInit"', '"app.common.errors.scope.customers_page_init"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.customersPageInit"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.dictList"', '"app.common.errors.scope.dict_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.dictList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.duplicateAction"', '"app.common.errors.scope.duplicate_action"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.duplicateAction"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.duplicateApi"', '"app.common.errors.scope.duplicate_api"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.duplicateApi"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.emailsenderProvidersList"', '"app.common.errors.scope.emailsender_providers_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.emailsenderProvidersList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.emailsenderProvidersPageInit"', '"app.common.errors.scope.emailsender_providers_page_init"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.emailsenderProvidersPageInit"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.emailsenderTemplatesList"', '"app.common.errors.scope.emailsender_templates_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.emailsenderTemplatesList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.errors.scope.emailsenderTemplatesPageInit"', '"app.common.errors.scope.emailsender_templates_page_init"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.errors.scope.emailsenderTemplatesPageInit"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportConfirm"', '"app.common.export_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportConfirmTitle"', '"app.common.export_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportCsv"', '"app.common.export_csv"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportCsv"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportExcel"', '"app.common.export_excel"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportExcel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportHtmlConfirm"', '"app.common.export_html_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportHtmlConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.exportHtmlConfirmTitle"', '"app.common.export_html_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.exportHtmlConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.hideDisabledOptions"', '"app.common.hide_disabled_options"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.hideDisabledOptions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.htmlPreviewTitle"', '"app.common.html_preview_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.htmlPreviewTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.impact.criticalError"', '"app.common.impact.critical_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.impact.criticalError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.lastUpdatedByMid"', '"app.common.last_updated_by_mid"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.lastUpdatedByMid"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.lastUpdatedPrefix"', '"app.common.last_updated_prefix"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.lastUpdatedPrefix"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.loadError"', '"app.common.load_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.loadError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.loadFailed"', '"app.common.load_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.loadFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.noChanges"', '"app.common.no_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.noChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.noResults"', '"app.common.no_results"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.noResults"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.optionalTooltipText"', '"app.common.optional_tooltip_text"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.optionalTooltipText"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.optionalTooltipTitle"', '"app.common.optional_tooltip_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.optionalTooltipTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreConfirm"', '"app.common.restore_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreConfirmTitle"', '"app.common.restore_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreEntitiesConfirm"', '"app.common.restore_entities_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreEntitiesConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreEntitiesTitle"', '"app.common.restore_entities_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreEntitiesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreEntityConfirm"', '"app.common.restore_entity_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreEntityConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.restoreEntityTitle"', '"app.common.restore_entity_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.restoreEntityTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.revertChanges"', '"app.common.revert_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.revertChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.rowActions"', '"app.common.row_actions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.rowActions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.saveChanges"', '"app.common.save_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.saveChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.saveFailed"', '"app.common.save_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.saveFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.saveSuccess"', '"app.common.save_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.saveSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.scrollToBottom"', '"app.common.scroll_to_bottom"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.scrollToBottom"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.selectAll"', '"app.common.select_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.selectAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.selectDate"', '"app.common.select_date"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.selectDate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.selectRow"', '"app.common.select_row"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.selectRow"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.selectValue"', '"app.common.select_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.selectValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.showDisabledOptions"', '"app.common.show_disabled_options"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.showDisabledOptions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.toggleSidebar"', '"app.common.toggle_sidebar"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.toggleSidebar"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.error"', '"app.common.tooltip_title.error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.error"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.hint"', '"app.common.tooltip_title.hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.hint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.information"', '"app.common.tooltip_title.information"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.information"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.question"', '"app.common.tooltip_title.question"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.question"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.success"', '"app.common.tooltip_title.success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.success"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.tooltipTitle.warning"', '"app.common.tooltip_title.warning"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.tooltipTitle.warning"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.acceptAll"', '"app.common.translations.accept_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.acceptAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.aiFailed"', '"app.common.translations.ai_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.aiFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.aiSkipped"', '"app.common.translations.ai_skipped"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.aiSkipped"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.aiUnavailable"', '"app.common.translations.ai_unavailable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.aiUnavailable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.enRequired"', '"app.common.translations.en_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.enRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.flushFailed"', '"app.common.translations.flush_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.flushFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.generateAll"', '"app.common.translations.generate_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.generateAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.translations.resultsTitle"', '"app.common.translations.results_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.translations.resultsTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.unsavedChanges"', '"app.common.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.emailRequired"', '"app.common.validation.email_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.emailRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidBigint"', '"app.common.validation.invalid_bigint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidBigint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidBigintUnsigned"', '"app.common.validation.invalid_bigint_unsigned"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidBigintUnsigned"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidBoolean"', '"app.common.validation.invalid_boolean"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidBoolean"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidEmail"', '"app.common.validation.invalid_email"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidEmail"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidFormat"', '"app.common.validation.invalid_format"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidFormat"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidInteger"', '"app.common.validation.invalid_integer"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidInteger"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidJson"', '"app.common.validation.invalid_json"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidJson"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidNumber"', '"app.common.validation.invalid_number"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidNumber"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidNumberUnsigned"', '"app.common.validation.invalid_number_unsigned"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidNumberUnsigned"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidPhone"', '"app.common.validation.invalid_phone"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidPhone"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidRegexPattern"', '"app.common.validation.invalid_regex_pattern"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidRegexPattern"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidUrl"', '"app.common.validation.invalid_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.invalidUrlProtocol"', '"app.common.validation.invalid_url_protocol"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.invalidUrlProtocol"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.nameTaken"', '"app.common.validation.name_taken"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.nameTaken"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.orgRequired"', '"app.common.validation.org_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.orgRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordLetter"', '"app.common.validation.password_letter"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordLetter"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordLowercase"', '"app.common.validation.password_lowercase"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordLowercase"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordMinLength"', '"app.common.validation.password_min_length"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordMinLength"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordNumber"', '"app.common.validation.password_number"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordNumber"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordPolicyAlphaNumeric"', '"app.common.validation.password_policy_alpha_numeric"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordPolicyAlphaNumeric"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordPolicyLetterAndNumber"', '"app.common.validation.password_policy_letter_and_number"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordPolicyLetterAndNumber"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordPolicyLetterNumberSpecial"', '"app.common.validation.password_policy_letter_number_special"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordPolicyLetterNumberSpecial"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordPolicyMixedCaseSpecial"', '"app.common.validation.password_policy_mixed_case_special"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordPolicyMixedCaseSpecial"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordRequired"', '"app.common.validation.password_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordSpecial"', '"app.common.validation.password_special"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordSpecial"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordUppercase"', '"app.common.validation.password_uppercase"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordUppercase"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.passwordWeak"', '"app.common.validation.password_weak"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.passwordWeak"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.regexMismatch"', '"app.common.validation.regex_mismatch"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.regexMismatch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.rolesRequired"', '"app.common.validation.roles_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.rolesRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.tooLong"', '"app.common.validation.too_long"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.tooLong"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.validation.tooShort"', '"app.common.validation.too_short"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.validation.tooShort"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.common.versionHistory"', '"app.common.version_history"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.common.versionHistory"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.docs.noResults"', '"app.docs.no_results"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.docs.noResults"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.docs.notFound"', '"app.docs.not_found"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.docs.notFound"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.docs.onThisPage"', '"app.docs.on_this_page"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.docs.onThisPage"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.docs.seeAlso"', '"app.docs.see_also"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.docs.seeAlso"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.docs.viewFull"', '"app.docs.view_full"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.docs.viewFull"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.errorDetails"', '"app.errors.error_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.errorDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.unhandledError"', '"app.errors.unhandled_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.unhandledError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.unhandledErrorFallback"', '"app.errors.unhandled_error_fallback"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.unhandledErrorFallback"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.unhandledRejection"', '"app.errors.unhandled_rejection"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.unhandledRejection"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.unhandledRejectionFallback"', '"app.errors.unhandled_rejection_fallback"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.unhandledRejectionFallback"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.errors.viewDetails"', '"app.errors.view_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.errors.viewDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.aiEnabled"', '"app.health.ai_enabled"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.aiEnabled"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.aiLlm"', '"app.health.ai_llm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.aiLlm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.backendVersion"', '"app.health.backend_version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.backendVersion"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.beOffline"', '"app.health.be_offline"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.beOffline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.beOnline"', '"app.health.be_online"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.beOnline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.browserVersion"', '"app.health.browser_version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.browserVersion"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.calendarSystem"', '"app.health.calendar_system"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.calendarSystem"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.clientTitle"', '"app.health.client_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.clientTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.coreModulesTitle"', '"app.health.core_modules_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.coreModulesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.cpuThreads"', '"app.health.cpu_threads"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.cpuThreads"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.dbOffline"', '"app.health.db_offline"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.dbOffline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.gpuDriver"', '"app.health.gpu_driver"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.gpuDriver"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.gpuRank"', '"app.health.gpu_rank"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.gpuRank"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.hourCycle"', '"app.health.hour_cycle"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.hourCycle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.ianaTimezone"', '"app.health.iana_timezone"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.ianaTimezone"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.identityProvider"', '"app.health.identity_provider"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.identityProvider"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.idpOffline"', '"app.health.idp_offline"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.idpOffline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.installedModulesTitle"', '"app.health.installed_modules_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.installedModulesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.microservicesTitle"', '"app.health.microservices_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.microservicesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.modulesTitle"', '"app.health.modules_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.modulesTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.natsOffline"', '"app.health.nats_offline"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.natsOffline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.noMicroservices"', '"app.health.no_microservices"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.noMicroservices"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.numberingSystem"', '"app.health.numbering_system"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.numberingSystem"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.operatingSystem"', '"app.health.operating_system"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.operatingSystem"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.osArch"', '"app.health.os_arch"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.osArch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.osVersion"', '"app.health.os_version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.osVersion"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.preferredLanguages"', '"app.health.preferred_languages"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.preferredLanguages"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.redisOffline"', '"app.health.redis_offline"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.redisOffline"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.resolvedLocale"', '"app.health.resolved_locale"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.resolvedLocale"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.shellVersion"', '"app.health.shell_version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.shellVersion"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.statusLabel"', '"app.health.status_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.statusLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.statusTooltip"', '"app.health.status_tooltip"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.statusTooltip"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.systemInfoTitle"', '"app.health.system_info_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.systemInfoTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.systemRam"', '"app.health.system_ram"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.systemRam"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.versionsTitle"', '"app.health.versions_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.versionsTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.health.vramEstimate"', '"app.health.vram_estimate"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.health.vramEstimate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.listFailed"', '"app.list_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.listFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.approveButton"', '"app.mcp.consent.approve_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.approveButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.clientName"', '"app.mcp.consent.client_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.clientName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.denyButton"', '"app.mcp.consent.deny_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.denyButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.invalidParams"', '"app.mcp.consent.invalid_params"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.invalidParams"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.loginFirst"', '"app.mcp.consent.login_first"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.loginFirst"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.loginRequired"', '"app.mcp.consent.login_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.loginRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.requestedScopes"', '"app.mcp.consent.requested_scopes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.requestedScopes"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.mcp.consent.securityNote"', '"app.mcp.consent.security_note"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.mcp.consent.securityNote"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.modulesLoadFailed"', '"app.modules_load_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.modulesLoadFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.nav.crmBreadcrumbMenu"', '"app.nav.crm_breadcrumb_menu"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.nav.crmBreadcrumbMenu"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.nav.crmFallback"', '"app.nav.crm_fallback"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.nav.crmFallback"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.nav.goTo"', '"app.nav.go_to"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.nav.goTo"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.nav.rootLevel"', '"app.nav.root_level"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.nav.rootLevel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.org.johnDoe"', '"app.org.john_doe"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.org.johnDoe"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.org.switcherAria"', '"app.org.switcher_aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.org.switcherAria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.rfcError.preview"', '"app.rfc_error.preview"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.rfcError.preview"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.rfcError.source"', '"app.rfc_error.source"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.rfcError.source"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.serverUnreachable"', '"app.server_unreachable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.serverUnreachable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.cancelLoad"', '"app.smart.guide.ai.cancel_load"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.cancelLoad"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.loadingModel"', '"app.smart.guide.ai.loading_model"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.loadingModel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.loadingVram"', '"app.smart.guide.ai.loading_vram"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.loadingVram"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.modelNotConfigured"', '"app.smart.guide.ai.model_not_configured"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.modelNotConfigured"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.modelReady"', '"app.smart.guide.ai.model_ready"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.modelReady"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.newSession"', '"app.smart.guide.ai.new_session"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.newSession"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.noDocumentation"', '"app.smart.guide.ai.no_documentation"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.noDocumentation"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.guide.ai.webgpuRequired"', '"app.smart.guide.ai.webgpu_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.guide.ai.webgpuRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.brainCta"', '"app.smart.json.ai.brain_cta"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.brainCta"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.cancelLoad"', '"app.smart.json.ai.cancel_load"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.cancelLoad"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.loadingModel"', '"app.smart.json.ai.loading_model"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.loadingModel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.loadingVram"', '"app.smart.json.ai.loading_vram"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.loadingVram"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.modelNotConfigured"', '"app.smart.json.ai.model_not_configured"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.modelNotConfigured"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.modelReady"', '"app.smart.json.ai.model_ready"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.modelReady"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.newSession"', '"app.smart.json.ai.new_session"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.newSession"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.json.ai.webgpuRequired"', '"app.smart.json.ai.webgpu_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.json.ai.webgpuRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.brainCta"', '"app.smart.regex.ai.brain_cta"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.brainCta"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.cancelLoad"', '"app.smart.regex.ai.cancel_load"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.cancelLoad"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.chooseOption"', '"app.smart.regex.ai.choose_option"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.chooseOption"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.flagsCta"', '"app.smart.regex.ai.flags_cta"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.flagsCta"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.hereYouAre"', '"app.smart.regex.ai.here_you_are"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.hereYouAre"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.hereYouAreWithDesc"', '"app.smart.regex.ai.here_you_are_with_desc"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.hereYouAreWithDesc"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.loadingModel"', '"app.smart.regex.ai.loading_model"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.loadingModel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.modelNotConfigured"', '"app.smart.regex.ai.model_not_configured"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.modelNotConfigured"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.modelReady"', '"app.smart.regex.ai.model_ready"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.modelReady"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.newSession"', '"app.smart.regex.ai.new_session"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.newSession"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.useThis"', '"app.smart.regex.ai.use_this"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.useThis"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.ai.webgpuRequired"', '"app.smart.regex.ai.webgpu_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.ai.webgpuRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.flags.globalHelp"', '"app.smart.regex.flags.global_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.flags.globalHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.flags.ignoreCase"', '"app.smart.regex.flags.ignore_case"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.flags.ignoreCase"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.flags.ignoreCaseHelp"', '"app.smart.regex.flags.ignore_case_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.flags.ignoreCaseHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.smart.regex.flags.multilineHelp"', '"app.smart.regex.flags.multiline_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.smart.regex.flags.multilineHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.accountSoon"', '"app.user_menu.account_soon"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.accountSoon"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.aria"', '"app.user_menu.aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.aria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemAccount"', '"app.user_menu.item_account"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemAccount"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemBilling"', '"app.user_menu.item_billing"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemBilling"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemNotifications"', '"app.user_menu.item_notifications"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemNotifications"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemSettings"', '"app.user_menu.item_settings"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemSettings"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemSignOut"', '"app.user_menu.item_sign_out"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemSignOut"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.itemUpgrade"', '"app.user_menu.item_upgrade"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.itemUpgrade"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.profileLabel"', '"app.user_menu.profile_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.profileLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.signOutSoon"', '"app.user_menu.sign_out_soon"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.signOutSoon"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.userMenu.title"', '"app.user_menu.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.userMenu.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"app.widgets.json.editMode"', '"app.widgets.json.edit_mode"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"app.widgets.json.editMode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.keys.moveDown"', '"app.common.move_down"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.keys.moveDown"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.keys.moveUp"', '"app.common.move_up"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.keys.moveUp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.crm.pipeline.cardTitle"', '"system.entities.crm.pipeline.card_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.crm.pipeline.cardTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.CREATE"', '"system.entities.customer.version_history.actions.create"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.CREATE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.DELETE"', '"system.entities.customer.version_history.actions.delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.HARD_DELETE"', '"system.entities.customer.version_history.actions.hard_delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.HARD_DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.INSERT"', '"system.entities.customer.version_history.actions.insert"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.INSERT"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.RESTORE"', '"system.entities.customer.version_history.actions.restore"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.RESTORE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.SOFT_DELETE"', '"system.entities.customer.version_history.actions.soft_delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.SOFT_DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.actions.UPDATE"', '"system.entities.customer.version_history.actions.update"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.actions.UPDATE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.changedFrom"', '"system.entities.customer.version_history.changed_from"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.changedFrom"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.cleared"', '"system.entities.customer.version_history.cleared"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.cleared"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.empty"', '"system.entities.customer.version_history.empty"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.empty"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.error"', '"system.entities.customer.version_history.error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.error"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.company_name"', '"system.entities.customer.version_history.field.company_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.company_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.display_name"', '"system.entities.customer.version_history.field.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.display_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.email"', '"system.entities.customer.version_history.field.email"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.email"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.first_name"', '"system.entities.customer.version_history.field.first_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.first_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.idp_code"', '"system.entities.customer.version_history.field.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.idp_code"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.last_name"', '"system.entities.customer.version_history.field.last_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.last_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.local_address"', '"system.entities.customer.version_history.field.local_address"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.local_address"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.local_city"', '"system.entities.customer.version_history.field.local_city"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.local_city"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.local_country"', '"system.entities.customer.version_history.field.local_country"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.local_country"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.local_state"', '"system.entities.customer.version_history.field.local_state"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.local_state"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.local_zip"', '"system.entities.customer.version_history.field.local_zip"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.local_zip"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.phone"', '"system.entities.customer.version_history.field.phone"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.phone"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.status"', '"system.entities.customer.version_history.field.status"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.status"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.field.status_reason"', '"system.entities.customer.version_history.field.status_reason"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.field.status_reason"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.fieldModified"', '"system.entities.customer.version_history.field_modified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.fieldModified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.hideDetails"', '"system.entities.customer.version_history.hide_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.hideDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.loading"', '"system.entities.customer.version_history.loading"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.loading"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.notSet"', '"system.entities.customer.version_history.not_set"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.notSet"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.null"', '"system.entities.customer.version_history.null"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.null"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.recordCreated"', '"system.entities.customer.version_history.record_created"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.recordCreated"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.recordDeleted"', '"system.entities.customer.version_history.record_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.recordDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.recordHardDeleted"', '"system.entities.customer.version_history.record_hard_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.recordHardDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.recordRestored"', '"system.entities.customer.version_history.record_restored"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.recordRestored"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.recordSoftDeleted"', '"system.entities.customer.version_history.record_soft_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.recordSoftDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.set"', '"system.entities.customer.version_history.set"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.set"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.showDetails"', '"system.entities.customer.version_history.show_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.showDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.title"', '"system.entities.customer.version_history.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.to"', '"system.entities.customer.version_history.to"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.to"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.unchanged"', '"system.entities.customer.version_history.unchanged"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.unchanged"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.customer.versionHistory.viewMore"', '"system.entities.customer.version_history.view_more"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.customer.versionHistory.viewMore"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.addFilter"', '"system.entities.list.add_filter"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.addFilter"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.advancedFilters"', '"system.entities.list.advanced_filters"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.advancedFilters"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.advancedFiltersPlaceholder"', '"system.entities.list.advanced_filters_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.advancedFiltersPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.allCriteria"', '"system.entities.list.all_criteria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.allCriteria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.atLeastOneCriteria"', '"system.entities.list.at_least_one_criteria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.atLeastOneCriteria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.auditingFields"', '"system.entities.list.auditing_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.auditingFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.booleanAny"', '"system.entities.list.boolean_any"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.booleanAny"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.booleanFalse"', '"system.entities.list.boolean_false"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.booleanFalse"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.booleanTrue"', '"system.entities.list.boolean_true"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.booleanTrue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.delete"', '"system.entities.list.bulk_actions.delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.delete"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.deleteConfirmTitle"', '"system.entities.list.bulk_actions.delete_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.deleteConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.duplicate"', '"system.entities.list.bulk_actions.duplicate"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.duplicate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.export"', '"system.entities.list.bulk_actions.export"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.export"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.exportHtml"', '"system.entities.list.bulk_actions.export_html"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.exportHtml"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.restore"', '"system.entities.list.bulk_actions.restore"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.restore"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.restoreConfirmTitle"', '"system.entities.list.bulk_actions.restore_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.restoreConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.toggleToBulk"', '"system.entities.list.bulk_actions.toggle_to_bulk"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.toggleToBulk"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkActions.toggleToFilters"', '"system.entities.list.bulk_actions.toggle_to_filters"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkActions.toggleToFilters"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkDeleteFailed"', '"system.entities.list.bulk_delete_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkDeleteFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.bulkRestoreFailed"', '"system.entities.list.bulk_restore_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.bulkRestoreFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.dataFields"', '"system.entities.list.data_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.dataFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.datetimeIana.hintBrowser"', '"system.entities.list.datetime_iana.hint_browser"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.datetimeIana.hintBrowser"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.datetimeIana.hintRecord"', '"system.entities.list.datetime_iana.hint_record"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.datetimeIana.hintRecord"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.deletionFilter.all"', '"system.entities.list.deletion_filter.all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.deletionFilter.all"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.deletionFilter.deleted"', '"system.entities.list.deletion_filter.deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.deletionFilter.deleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.deletionFilter.groupAria"', '"system.entities.list.deletion_filter.group_aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.deletionFilter.groupAria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.deletionFilter.nonDeleted"', '"system.entities.list.deletion_filter.non_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.deletionFilter.nonDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.deselectAll"', '"system.entities.list.deselect_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.deselectAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.duplicateMaxLimit"', '"system.entities.list.duplicate_max_limit"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.duplicateMaxLimit"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.duplicatePartialSuccess"', '"system.entities.list.duplicate_partial_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.duplicatePartialSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.duplicateSuccess"', '"system.entities.list.duplicate_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.duplicateSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.editModeLabel"', '"system.entities.list.edit_mode_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.editModeLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.emptyField"', '"system.entities.list.empty_field"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.emptyField"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.filterBadge.noFiltersApplied"', '"system.entities.list.filter_badge.no_filters_applied"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.filterBadge.noFiltersApplied"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.filterBadge.separator"', '"system.entities.list.filter_badge.separator"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.filterBadge.separator"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.filterPlaceholder"', '"system.entities.list.filter_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.filterPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.filterValueHint"', '"system.entities.list.filter_value_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.filterValueHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.filtersHint"', '"system.entities.list.filters_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.filtersHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.inOrder"', '"system.entities.list.in_order"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.inOrder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.keyboardCommands"', '"system.entities.list.keyboard_commands"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.keyboardCommands"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.keys.firstLast"', '"system.entities.list.keys.first_last"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.keys.firstLast"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.noFilterableFields"', '"system.entities.list.no_filterable_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.noFilterableFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.noRecords"', '"system.entities.list.no_records"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.noRecords"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.noSelectedRowsInView"', '"system.entities.list.no_selected_rows_in_view"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.noSelectedRowsInView"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.!="', '"system.entities.list.operators.neq"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.!="%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.<"', '"system.entities.list.operators.lt"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.<"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.<="', '"system.entities.list.operators.lte"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.<="%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.="', '"system.entities.list.operators.eq"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.="%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.>"', '"system.entities.list.operators.gt"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.>"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.>="', '"system.entities.list.operators.gte"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.>="%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.BETWEEN"', '"system.entities.list.operators.between"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.BETWEEN"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.endsWith"', '"system.entities.list.operators.ends_with"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.endsWith"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.operators.startsWith"', '"system.entities.list.operators.starts_with"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.operators.startsWith"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.pageSize"', '"system.entities.list.page_size"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.pageSize"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.pagination.firstPage"', '"system.entities.list.pagination.first_page"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.pagination.firstPage"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.pagination.lastPage"', '"system.entities.list.pagination.last_page"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.pagination.lastPage"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.pagination.nextPage"', '"system.entities.list.pagination.next_page"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.pagination.nextPage"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.pagination.previousPage"', '"system.entities.list.pagination.previous_page"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.pagination.previousPage"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.paginationStatus"', '"system.entities.list.pagination_status"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.paginationStatus"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.previewPanelTitle"', '"system.entities.list.preview_panel_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.previewPanelTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.rowActions"', '"system.entities.list.row_actions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.rowActions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.searchFields"', '"system.entities.list.search_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.searchFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.searchIn"', '"system.entities.list.search_in"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.searchIn"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.searchInAll"', '"system.entities.list.search_in_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.searchInAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.searchInFields"', '"system.entities.list.search_in_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.searchInFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.searchPlaceholder"', '"system.entities.list.search_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.searchPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectAll"', '"system.entities.list.select_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectField"', '"system.entities.list.select_field"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectField"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectRow"', '"system.entities.list.select_row"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectRow"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectValue"', '"system.entities.list.select_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectedPlural"', '"system.entities.list.selected_plural"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectedPlural"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectedRowsNotLoadedHint"', '"system.entities.list.selected_rows_not_loaded_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectedRowsNotLoadedHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.selectedSingular"', '"system.entities.list.selected_singular"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.selectedSingular"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.sortBy"', '"system.entities.list.sort_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.sortBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.standardFilters"', '"system.entities.list.standard_filters"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.standardFilters"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.stickyFields"', '"system.entities.list.sticky_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.stickyFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.togglePreviewPanel"', '"system.entities.list.toggle_preview_panel"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.togglePreviewPanel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewAllRowsTitle"', '"system.entities.list.view_all_rows_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewAllRowsTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewMode.cards"', '"system.entities.list.view_mode.cards"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewMode.cards"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewMode.cardsList"', '"system.entities.list.view_mode.cards_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewMode.cardsList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewMode.groupAria"', '"system.entities.list.view_mode.group_aria"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewMode.groupAria"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewMode.table"', '"system.entities.list.view_mode.table"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewMode.table"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewModeLabel"', '"system.entities.list.view_mode_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewModeLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.list.viewSelectedOnlyTitle"', '"system.entities.list.view_selected_only_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.list.viewSelectedOnlyTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.CREATE"', '"system.entities.version_history.actions.create"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.CREATE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.DELETE"', '"system.entities.version_history.actions.delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.HARD_DELETE"', '"system.entities.version_history.actions.hard_delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.HARD_DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.INSERT"', '"system.entities.version_history.actions.insert"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.INSERT"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.RESTORE"', '"system.entities.version_history.actions.restore"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.RESTORE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.SOFT_DELETE"', '"system.entities.version_history.actions.soft_delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.SOFT_DELETE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.actions.UPDATE"', '"system.entities.version_history.actions.update"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.actions.UPDATE"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.changedFrom"', '"system.entities.version_history.changed_from"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.changedFrom"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.cleared"', '"system.entities.version_history.cleared"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.cleared"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.empty"', '"system.entities.version_history.empty"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.empty"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.emptyList"', '"system.entities.version_history.empty_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.emptyList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.error"', '"system.entities.version_history.error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.error"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.created_at"', '"system.entities.version_history.field.created_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.created_at"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.created_by"', '"system.entities.version_history.field.created_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.created_by"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.deleted_at"', '"system.entities.version_history.field.deleted_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.deleted_at"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.deleted_by"', '"system.entities.version_history.field.deleted_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.deleted_by"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.description_key"', '"system.entities.version_history.field.description_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.description_key"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.display_name"', '"system.entities.version_history.field.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.display_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.group_key"', '"system.entities.version_history.field.group_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.group_key"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.id"', '"system.entities.version_history.field.id"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.id"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.idp_code"', '"system.entities.version_history.field.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.idp_code"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.idp_name"', '"system.entities.version_history.field.idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.idp_name"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.idp_owner"', '"system.entities.version_history.field.idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.idp_owner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.key"', '"system.entities.version_history.field.key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.key"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.label_key"', '"system.entities.version_history.field.label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.label_key"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.last_synced_at"', '"system.entities.version_history.field.last_synced_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.last_synced_at"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.reserved"', '"system.entities.version_history.field.reserved"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.reserved"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.type"', '"system.entities.version_history.field.type"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.type"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.type_config"', '"system.entities.version_history.field.type_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.type_config"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.updated_at"', '"system.entities.version_history.field.updated_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.updated_at"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.updated_by"', '"system.entities.version_history.field.updated_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.updated_by"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.user_count"', '"system.entities.version_history.field.user_count"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.user_count"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.uuid"', '"system.entities.version_history.field.uuid"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.uuid"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.value"', '"system.entities.version_history.field.value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.value"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.version"', '"system.entities.version_history.field.version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.version"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.field.website_url"', '"system.entities.version_history.field.website_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.field.website_url"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.fieldModified"', '"system.entities.version_history.field_modified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.fieldModified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.hideDetails"', '"system.entities.version_history.hide_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.hideDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.loading"', '"system.entities.version_history.loading"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.loading"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.notSet"', '"system.entities.version_history.not_set"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.notSet"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.null"', '"system.entities.version_history.null"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.null"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.recordCreated"', '"system.entities.version_history.record_created"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.recordCreated"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.recordHardDeleted"', '"system.entities.version_history.record_hard_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.recordHardDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.recordRestored"', '"system.entities.version_history.record_restored"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.recordRestored"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.recordSoftDeleted"', '"system.entities.version_history.record_soft_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.recordSoftDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.set"', '"system.entities.version_history.set"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.set"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.showDetails"', '"system.entities.version_history.show_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.showDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.title"', '"system.entities.version_history.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.to"', '"system.entities.version_history.to"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.to"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.unchanged"', '"system.entities.version_history.unchanged"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.unchanged"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.entities.versionHistory.viewMore"', '"system.entities.version_history.view_more"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.entities.versionHistory.viewMore"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.actionFailed"', '"system.migrations.action_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.actionFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.actions.driftCheck"', '"system.migrations.actions.drift_check"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.actions.driftCheck"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.approveOk"', '"system.migrations.approve_ok"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.approveOk"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.columns.appliedAt"', '"system.migrations.columns.applied_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.columns.appliedAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.columns.signedBy"', '"system.migrations.columns.signed_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.columns.signedBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.dialog.approveTitle"', '"system.migrations.dialog.approve_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.dialog.approveTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.dialog.resolveTitle"', '"system.migrations.dialog.resolve_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.dialog.resolveTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.lastError"', '"system.migrations.last_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.lastError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.noPatches"', '"system.migrations.no_patches"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.noPatches"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.resolveOk"', '"system.migrations.resolve_ok"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.resolveOk"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.migrations.retryOk"', '"system.migrations.retry_ok"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.migrations.retryOk"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.roles.testRole"', '"system.roles.test_role"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.roles.testRole"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.createdAt"', '"system.settings.audit.created_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.createdAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.createdBy"', '"system.settings.audit.created_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.createdBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.deletedAt"', '"system.settings.audit.deleted_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.deletedAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.deletedBy"', '"system.settings.audit.deleted_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.deletedBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.lastSyncedAt"', '"system.settings.audit.last_synced_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.lastSyncedAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.updatedAt"', '"system.settings.audit.updated_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.updatedAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.audit.updatedBy"', '"system.settings.audit.updated_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.audit.updatedBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.breadcrumbMenu"', '"system.settings.breadcrumb_menu"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.breadcrumbMenu"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.auth.auth_roles_path.errors.invalidFormat"', '"system.settings.config.auth.auth_roles_path.errors.invalid_format"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.auth.auth_roles_path.errors.invalidFormat"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.auth.oidc_client_id.errors.invalidFormat"', '"system.settings.config.auth.oidc_client_id.errors.invalid_format"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.auth.oidc_client_id.errors.invalidFormat"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.currencySelect.allCurrencies"', '"system.settings.config.currency_select.all_currencies"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.currencySelect.allCurrencies"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.currencySelect.favorites"', '"system.settings.config.currency_select.favorites"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.currencySelect.favorites"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.currencySelect.noResults"', '"system.settings.config.currency_select.no_results"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.currencySelect.noResults"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.currencySelect.searchPlaceholder"', '"system.settings.config.currency_select.search_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.currencySelect.searchPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.currencySelect.title"', '"system.settings.config.currency_select.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.currencySelect.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.allCountries"', '"system.settings.config.phone_prefix_select.all_countries"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.allCountries"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.noResults"', '"system.settings.config.phone_prefix_select.no_results"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.noResults"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.searchPlaceholder"', '"system.settings.config.phone_prefix_select.search_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.searchPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.sortByName"', '"system.settings.config.phone_prefix_select.sort_by_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.sortByName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.sortByPrefix"', '"system.settings.config.phone_prefix_select.sort_by_prefix"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.sortByPrefix"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.suggested"', '"system.settings.config.phone_prefix_select.suggested"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.suggested"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.phonePrefixSelect.title"', '"system.settings.config.phone_prefix_select.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.phonePrefixSelect.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.ftp"', '"system.settings.config.protocol_select.desc.ftp"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.ftp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.http"', '"system.settings.config.protocol_select.desc.http"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.http"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.https"', '"system.settings.config.protocol_select.desc.https"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.https"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.mailto"', '"system.settings.config.protocol_select.desc.mailto"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.mailto"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.redis"', '"system.settings.config.protocol_select.desc.redis"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.redis"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.rediss"', '"system.settings.config.protocol_select.desc.rediss"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.rediss"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.tcp"', '"system.settings.config.protocol_select.desc.tcp"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.tcp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.ws"', '"system.settings.config.protocol_select.desc.ws"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.ws"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.desc.wss"', '"system.settings.config.protocol_select.desc.wss"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.desc.wss"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.noResults"', '"system.settings.config.protocol_select.no_results"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.noResults"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.protocolSelect.title"', '"system.settings.config.protocol_select.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.protocolSelect.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.addValue"', '"system.settings.config.type_config.add_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.addValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.advancedMode"', '"system.settings.config.type_config.advanced_mode"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.advancedMode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.advancedModeHelp"', '"system.settings.config.type_config.advanced_mode_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.advancedModeHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedCountries"', '"system.settings.config.type_config.allowed_countries"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedCountries"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedCountriesHelp"', '"system.settings.config.type_config.allowed_countries_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedCountriesHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedCurrencies"', '"system.settings.config.type_config.allowed_currencies"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedCurrencies"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedCurrenciesHelp"', '"system.settings.config.type_config.allowed_currencies_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedCurrenciesHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedProtocols"', '"system.settings.config.type_config.allowed_protocols"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedProtocols"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.allowedProtocolsHelp"', '"system.settings.config.type_config.allowed_protocols_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.allowedProtocolsHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.apiUrl"', '"system.settings.config.type_config.api_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.apiUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeAddTitle"', '"system.settings.config.type_config.badge_add_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeAddTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeCode"', '"system.settings.config.type_config.badge_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeCodeDuplicate"', '"system.settings.config.type_config.badge_code_duplicate"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeCodeDuplicate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeCodeHelp"', '"system.settings.config.type_config.badge_code_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeCodeHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeCodeInvalid"', '"system.settings.config.type_config.badge_code_invalid"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeCodeInvalid"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeColor"', '"system.settings.config.type_config.badge_color"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeColor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeColorHelp"', '"system.settings.config.type_config.badge_color_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeColorHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeEditTitle"', '"system.settings.config.type_config.badge_edit_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeEditTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeLabelKey"', '"system.settings.config.type_config.badge_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeLabelKeyHelp"', '"system.settings.config.type_config.badge_label_key_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeLabelKeyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.badgeValues"', '"system.settings.config.type_config.badge_values"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.badgeValues"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.builtinSource"', '"system.settings.config.type_config.builtin_source"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.builtinSource"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultCountry"', '"system.settings.config.type_config.default_country"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultCountry"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultCountryHelp"', '"system.settings.config.type_config.default_country_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultCountryHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultCurrency"', '"system.settings.config.type_config.default_currency"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultCurrency"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultCurrencyHelp"', '"system.settings.config.type_config.default_currency_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultCurrencyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultProtocol"', '"system.settings.config.type_config.default_protocol"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultProtocol"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.defaultProtocolHelp"', '"system.settings.config.type_config.default_protocol_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.defaultProtocolHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.emailValidation"', '"system.settings.config.type_config.email_validation"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.emailValidation"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.emailValidationHelp"', '"system.settings.config.type_config.email_validation_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.emailValidationHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.errorLabelKey"', '"system.settings.config.type_config.error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.errorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.httpVerb"', '"system.settings.config.type_config.http_verb"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.httpVerb"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.invalidJson"', '"system.settings.config.type_config.invalid_json"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.invalidJson"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.jsonPreview"', '"system.settings.config.type_config.json_preview"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.jsonPreview"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.labelField"', '"system.settings.config.type_config.label_field"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.labelField"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.maxErrorLabelKey"', '"system.settings.config.type_config.max_error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.maxErrorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.maxHelp"', '"system.settings.config.type_config.max_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.maxHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.maxLength"', '"system.settings.config.type_config.max_length"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.maxLength"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.maxValue"', '"system.settings.config.type_config.max_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.maxValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.minErrorLabelKey"', '"system.settings.config.type_config.min_error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.minErrorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.minHelp"', '"system.settings.config.type_config.min_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.minHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.minLength"', '"system.settings.config.type_config.min_length"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.minLength"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.minValue"', '"system.settings.config.type_config.min_value"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.minValue"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.moneyConfig"', '"system.settings.config.type_config.money_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.moneyConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.noBadgeValues"', '"system.settings.config.type_config.no_badge_values"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.noBadgeValues"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.phoneConfig"', '"system.settings.config.type_config.phone_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.phoneConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.regexErrorLabelKey"', '"system.settings.config.type_config.regex_error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.regexErrorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.regexPattern"', '"system.settings.config.type_config.regex_pattern"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.regexPattern"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.regexPatternHelp"', '"system.settings.config.type_config.regex_pattern_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.regexPatternHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.regexPatternPlaceholder"', '"system.settings.config.type_config.regex_pattern_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.regexPatternPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.remove"', '"system.settings.config.type_config.remove"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.remove"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.required"', '"system.settings.config.type_config.required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.required"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.requiredErrorLabelKey"', '"system.settings.config.type_config.required_error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.requiredErrorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.requiredHelp"', '"system.settings.config.type_config.required_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.requiredHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.selectConfig"', '"system.settings.config.type_config.select_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.selectConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.selectSource"', '"system.settings.config.type_config.select_source"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.selectSource"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.sourceApi"', '"system.settings.config.type_config.source_api"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.sourceApi"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.sourceBuiltin"', '"system.settings.config.type_config.source_builtin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.sourceBuiltin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.sourceMode"', '"system.settings.config.type_config.source_mode"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.sourceMode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.unsigned"', '"system.settings.config.type_config.unsigned"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.unsigned"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.unsignedHelp"', '"system.settings.config.type_config.unsigned_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.unsignedHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.urlConfig"', '"system.settings.config.type_config.url_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.urlConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.urlErrorLabelKey"', '"system.settings.config.type_config.url_error_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.urlErrorLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.urlProtocols"', '"system.settings.config.type_config.url_protocols"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.urlProtocols"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.validationRules"', '"system.settings.config.type_config.validation_rules"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.validationRules"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.valueField"', '"system.settings.config.type_config.value_field"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.valueField"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.valuesSource.ai_models"', '"system.settings.config.type_config.values_source.ai_models"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.valuesSource.ai_models"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.config.typeConfig.valuesSource.currencies"', '"system.settings.config.type_config.values_source.currencies"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.config.typeConfig.valuesSource.currencies"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.addConfigKey"', '"system.settings.configurations.add_config_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.addConfigKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.bulkDelete"', '"system.settings.configurations.bulk_delete"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.bulkDelete"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.changesPendingCount"', '"system.settings.configurations.changes_pending_count"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.changesPendingCount"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.changesPendingFields"', '"system.settings.configurations.changes_pending_fields"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.changesPendingFields"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.createSuccess"', '"system.settings.configurations.create.create_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.createSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.descriptionKey"', '"system.settings.configurations.create.description_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.descriptionKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.descriptionKeyHelp"', '"system.settings.configurations.create.description_key_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.descriptionKeyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.groupKey"', '"system.settings.configurations.create.group_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.groupKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.groupKeyHelp"', '"system.settings.configurations.create.group_key_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.groupKeyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.groupKeyPlaceholder"', '"system.settings.configurations.create.group_key_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.groupKeyPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.groupKeySearch"', '"system.settings.configurations.create.group_key_search"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.groupKeySearch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.keyExists"', '"system.settings.configurations.create.key_exists"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.keyExists"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.keyHelp"', '"system.settings.configurations.create.key_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.keyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.keyPlaceholder"', '"system.settings.configurations.create.key_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.keyPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.labelKey"', '"system.settings.configurations.create.label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.labelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.labelKeyHelp"', '"system.settings.configurations.create.label_key_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.labelKeyHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.reservedHelp"', '"system.settings.configurations.create.reserved_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.reservedHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.typeConfig"', '"system.settings.configurations.create.type_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.typeConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.typeHelp"', '"system.settings.configurations.create.type_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.typeHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.unsavedChanges"', '"system.settings.configurations.create.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.valueHelp"', '"system.settings.configurations.create.value_help"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.valueHelp"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.create.valuePlaceholder"', '"system.settings.configurations.create.value_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.create.valuePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.noChanges"', '"system.settings.configurations.no_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.noChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.noEntries"', '"system.settings.configurations.no_entries"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.noEntries"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.configurations.reservedBadge"', '"system.settings.configurations.reserved_badge"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.configurations.reservedBadge"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.credentials.changePassword.button"', '"system.settings.credentials.change_password.button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.credentials.changePassword.button"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.credentials.changePassword.description"', '"system.settings.credentials.change_password.description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.credentials.changePassword.description"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.credentials.changePassword.title"', '"system.settings.credentials.change_password.title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.credentials.changePassword.title"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.behindScaler"', '"system.settings.modules.behind_scaler"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.behindScaler"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.baseUrl"', '"system.settings.modules.config.base_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.baseUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.configNotAvailable"', '"system.settings.modules.config.config_not_available"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.configNotAvailable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.githubRepoUrl"', '"system.settings.modules.config.github_repo_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.githubRepoUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconPlaceholder"', '"system.settings.modules.config.icon_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconType"', '"system.settings.modules.config.icon_type"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconType"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconTypeBase64"', '"system.settings.modules.config.icon_type_base64"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconTypeBase64"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconTypeIcon"', '"system.settings.modules.config.icon_type_icon"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconTypeIcon"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconTypeSvg"', '"system.settings.modules.config.icon_type_svg"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconTypeSvg"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.iconTypeUrl"', '"system.settings.modules.config.icon_type_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.iconTypeUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.moduleConfig"', '"system.settings.modules.config.module_config"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.moduleConfig"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.noConfigEntries"', '"system.settings.modules.config.no_config_entries"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.noConfigEntries"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.serviceInfo"', '"system.settings.modules.config.service_info"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.serviceInfo"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.serviceVersion"', '"system.settings.modules.config.service_version"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.serviceVersion"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.config.serviceVersionHint"', '"system.settings.modules.config.service_version_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.config.serviceVersionHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.deleteFailed"', '"system.settings.modules.delete_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.deleteFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.importModule"', '"system.settings.modules.import_module"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.importModule"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.installedModules"', '"system.settings.modules.installed_modules"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.installedModules"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.lastSeen"', '"system.settings.modules.last_seen"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.lastSeen"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.loadFailed"', '"system.settings.modules.load_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.loadFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.moduleDeleted"', '"system.settings.modules.module_deleted"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.moduleDeleted"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.moduleDisabled"', '"system.settings.modules.module_disabled"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.moduleDisabled"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.moduleEnabled"', '"system.settings.modules.module_enabled"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.moduleEnabled"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.noModules"', '"system.settings.modules.no_modules"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.noModules"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.noModulesHint"', '"system.settings.modules.no_modules_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.noModulesHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.notImplemented"', '"system.settings.modules.not_implemented"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.notImplemented"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.openMarketplace"', '"system.settings.modules.open_marketplace"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.openMarketplace"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.modules.toggleFailed"', '"system.settings.modules.toggle_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.modules.toggleFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.copyIdpCode"', '"system.settings.organizations.create.copy_idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.copyIdpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.copyIdpOwner"', '"system.settings.organizations.create.copy_idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.copyIdpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.displayName"', '"system.settings.organizations.create.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.displayName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.displayNamePlaceholder"', '"system.settings.organizations.create.display_name_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.displayNamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.idpCode"', '"system.settings.organizations.create.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.idpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.idpName"', '"system.settings.organizations.create.idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.idpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.idpOwner"', '"system.settings.organizations.create.idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.idpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.unsavedChanges"', '"system.settings.organizations.create.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.create.websiteUrl"', '"system.settings.organizations.create.website_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.create.websiteUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.copyIdpCode"', '"system.settings.organizations.update.copy_idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.copyIdpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.copyIdpName"', '"system.settings.organizations.update.copy_idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.copyIdpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.copyIdpOwner"', '"system.settings.organizations.update.copy_idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.copyIdpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.displayName"', '"system.settings.organizations.update.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.displayName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.displayNamePlaceholder"', '"system.settings.organizations.update.display_name_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.displayNamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.idpCode"', '"system.settings.organizations.update.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.idpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.idpName"', '"system.settings.organizations.update.idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.idpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.idpOwner"', '"system.settings.organizations.update.idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.idpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.unsavedChanges"', '"system.settings.organizations.update.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.organizations.update.websiteUrl"', '"system.settings.organizations.update.website_url"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.organizations.update.websiteUrl"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.avatarColor"', '"system.settings.profile.avatar_color"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.avatarColor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.copyIdpCode"', '"system.settings.profile.copy_idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.copyIdpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.copyIdpIssuer"', '"system.settings.profile.copy_idp_issuer"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.copyIdpIssuer"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.copyIdpName"', '"system.settings.profile.copy_idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.copyIdpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.copyIdpOwner"', '"system.settings.profile.copy_idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.copyIdpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.createdAt"', '"system.settings.profile.created_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.createdAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.createdBy"', '"system.settings.profile.created_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.createdBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.displayName"', '"system.settings.profile.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.displayName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.displayNamePlaceholder"', '"system.settings.profile.display_name_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.displayNamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.emailPlaceholder"', '"system.settings.profile.email_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.emailPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpAdmin"', '"system.settings.profile.idp_admin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpAdmin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpCode"', '"system.settings.profile.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpEmailVerified"', '"system.settings.profile.idp_email_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpEmailVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpIssuer"', '"system.settings.profile.idp_issuer"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpIssuer"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpName"', '"system.settings.profile.idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpOwner"', '"system.settings.profile.idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.idpVerified"', '"system.settings.profile.idp_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.idpVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.rolesPlaceholder"', '"system.settings.profile.roles_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.rolesPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.selectColor"', '"system.settings.profile.select_color"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.selectColor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.unsavedChanges"', '"system.settings.profile.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.updatedAt"', '"system.settings.profile.updated_at"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.updatedAt"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.profile.updatedBy"', '"system.settings.profile.updated_by"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.profile.updatedBy"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colActions"', '"system.settings.roles.col_actions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colActions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colAdmin"', '"system.settings.roles.col_admin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colAdmin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colIdpOrg"', '"system.settings.roles.col_idp_org"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colIdpOrg"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colIdpRole"', '"system.settings.roles.col_idp_role"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colIdpRole"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colLabel"', '"system.settings.roles.col_label"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colLabel"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colLastSynced"', '"system.settings.roles.col_last_synced"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colLastSynced"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.colPermissions"', '"system.settings.roles.col_permissions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.colPermissions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.createSubtitle"', '"system.settings.roles.create_subtitle"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.createSubtitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.createTitle"', '"system.settings.roles.create_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.createTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.deleteConfirmBody"', '"system.settings.roles.delete_confirm_body"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.deleteConfirmBody"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.deleteConfirmTitle"', '"system.settings.roles.delete_confirm_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.deleteConfirmTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.editSubtitle"', '"system.settings.roles.edit_subtitle"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.editSubtitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.editTitle"', '"system.settings.roles.edit_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.editTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpOrg"', '"system.settings.roles.field_idp_org"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpOrg"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpOrgHint"', '"system.settings.roles.field_idp_org_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpOrgHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpOrgImmutable"', '"system.settings.roles.field_idp_org_immutable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpOrgImmutable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpOrgPlaceholder"', '"system.settings.roles.field_idp_org_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpOrgPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpRole"', '"system.settings.roles.field_idp_role"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpRole"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpRoleHint"', '"system.settings.roles.field_idp_role_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpRoleHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIdpRoleImmutable"', '"system.settings.roles.field_idp_role_immutable"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIdpRoleImmutable"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIsAdmin"', '"system.settings.roles.field_is_admin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIsAdmin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldIsAdminHint"', '"system.settings.roles.field_is_admin_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldIsAdminHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldLabelKey"', '"system.settings.roles.field_label_key"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldLabelKey"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.fieldLabelKeyHint"', '"system.settings.roles.field_label_key_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.fieldLabelKeyHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.lastSynced"', '"system.settings.roles.last_synced"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.lastSynced"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.modeHide"', '"system.settings.roles.mode_hide"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.modeHide"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.modeShowAll"', '"system.settings.roles.mode_show_all"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.modeShowAll"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.notFound"', '"system.settings.roles.not_found"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.notFound"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.permissionsEmpty"', '"system.settings.roles.permissions_empty"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.permissionsEmpty"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.permissionsLoading"', '"system.settings.roles.permissions_loading"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.permissionsLoading"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.searchPlaceholder"', '"system.settings.roles.search_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.searchPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.tabDetails"', '"system.settings.roles.tab_details"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.tabDetails"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.tabPermissions"', '"system.settings.roles.tab_permissions"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.tabPermissions"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.validation.idpOrgRequired"', '"system.settings.roles.validation.idp_org_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.validation.idpOrgRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.validation.idpRoleFormat"', '"system.settings.roles.validation.idp_role_format"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.validation.idpRoleFormat"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.roles.validation.idpRoleRequired"', '"system.settings.roles.validation.idp_role_required"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.roles.validation.idpRoleRequired"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.changePassword"', '"system.settings.security.change_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.changePassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.changePasswordButton"', '"system.settings.security.change_password_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.changePasswordButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.changingPassword"', '"system.settings.security.changing_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.changingPassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.confirmDeleteAccount"', '"system.settings.security.confirm_delete_account"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.confirmDeleteAccount"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.confirmPassword"', '"system.settings.security.confirm_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.confirmPassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.confirmPasswordPlaceholder"', '"system.settings.security.confirm_password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.confirmPasswordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.currentPassword"', '"system.settings.security.current_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.currentPassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.currentPasswordPlaceholder"', '"system.settings.security.current_password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.currentPasswordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.deleteAccount"', '"system.settings.security.delete_account"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.deleteAccount"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.deleteAccountButton"', '"system.settings.security.delete_account_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.deleteAccountButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.deleteAccountWarning"', '"system.settings.security.delete_account_warning"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.deleteAccountWarning"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.newPassword"', '"system.settings.security.new_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.newPassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.newPasswordPlaceholder"', '"system.settings.security.new_password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.newPasswordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.oidcClientId"', '"system.settings.security.oidc_client_id"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.oidcClientId"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.oidcClientSecret"', '"system.settings.security.oidc_client_secret"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.oidcClientSecret"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.oidcIssuer"', '"system.settings.security.oidc_issuer"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.oidcIssuer"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.oidcParams"', '"system.settings.security.oidc_params"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.oidcParams"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.oidcSaveButton"', '"system.settings.security.oidc_save_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.oidcSaveButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.passwordChangedError"', '"system.settings.security.password_changed_error"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.passwordChangedError"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.passwordChangedSuccess"', '"system.settings.security.password_changed_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.passwordChangedSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.security.passwordsDoNotMatch"', '"system.settings.security.passwords_do_not_match"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.security.passwordsDoNotMatch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.templates.createTemplate"', '"system.settings.templates.create_template"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.templates.createTemplate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.templates.selectTemplateFile"', '"system.settings.templates.select_template_file"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.templates.selectTemplateFile"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.templates.templatesList"', '"system.settings.templates.templates_list"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.templates.templatesList"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.templates.uploadButton"', '"system.settings.templates.upload_button"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.templates.uploadButton"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.templates.uploadTemplate"', '"system.settings.templates.upload_template"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.templates.uploadTemplate"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePassword"', '"system.settings.users.change_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordConfirm"', '"system.settings.users.change_password_confirm"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordConfirm"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordConfirmPlaceholder"', '"system.settings.users.change_password_confirm_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordConfirmPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordDescription"', '"system.settings.users.change_password_description"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordDescription"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordFailed"', '"system.settings.users.change_password_failed"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordFailed"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordMismatch"', '"system.settings.users.change_password_mismatch"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordMismatch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordNew"', '"system.settings.users.change_password_new"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordNew"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordNewPlaceholder"', '"system.settings.users.change_password_new_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordNewPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordSuccess"', '"system.settings.users.change_password_success"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordSuccess"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.changePasswordTitle"', '"system.settings.users.change_password_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.changePasswordTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.avatarColor"', '"system.settings.users.create.avatar_color"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.avatarColor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.avatarInitials"', '"system.settings.users.create.avatar_initials"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.avatarInitials"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.avatarInitialsPlaceholder"', '"system.settings.users.create.avatar_initials_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.avatarInitialsPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.copyIdpCode"', '"system.settings.users.create.copy_idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.copyIdpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.copyIdpUsername"', '"system.settings.users.create.copy_idp_username"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.copyIdpUsername"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.displayName"', '"system.settings.users.create.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.displayName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.displayNamePlaceholder"', '"system.settings.users.create.display_name_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.displayNamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.emailPlaceholder"', '"system.settings.users.create.email_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.emailPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpActive"', '"system.settings.users.create.idp_active"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpActive"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpAdmin"', '"system.settings.users.create.idp_admin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpAdmin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpAdminHint"', '"system.settings.users.create.idp_admin_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpAdminHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpCode"', '"system.settings.users.create.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpEmailVerified"', '"system.settings.users.create.idp_email_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpEmailVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpEmailVerifiedHint"', '"system.settings.users.create.idp_email_verified_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpEmailVerifiedHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpOrg"', '"system.settings.users.create.idp_org"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpOrg"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpOrgPlaceholder"', '"system.settings.users.create.idp_org_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpOrgPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpOrgSearch"', '"system.settings.users.create.idp_org_search"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpOrgSearch"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpPassword"', '"system.settings.users.create.idp_password"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpPassword"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpUsername"', '"system.settings.users.create.idp_username"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpUsername"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpVerified"', '"system.settings.users.create.idp_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.idpVerifiedHint"', '"system.settings.users.create.idp_verified_hint"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.idpVerifiedHint"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.invitationSent"', '"system.settings.users.create.invitation_sent"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.invitationSent"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.passwordPlaceholder"', '"system.settings.users.create.password_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.passwordPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.rolesPlaceholder"', '"system.settings.users.create.roles_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.rolesPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.sendInvitation"', '"system.settings.users.create.send_invitation"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.sendInvitation"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.sendInvitationTooltip"', '"system.settings.users.create.send_invitation_tooltip"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.sendInvitationTooltip"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.sendInvitationTooltipTitle"', '"system.settings.users.create.send_invitation_tooltip_title"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.sendInvitationTooltipTitle"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.unsavedChanges"', '"system.settings.users.create.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.unsavedChanges"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.usernameDisabledPlaceholder"', '"system.settings.users.create.username_disabled_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.usernameDisabledPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.usernamePlaceholder"', '"system.settings.users.create.username_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.usernamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.create.usernameSelectOrgFirst"', '"system.settings.users.create.username_select_org_first"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.create.usernameSelectOrgFirst"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.avatarColor"', '"system.settings.users.update.avatar_color"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.avatarColor"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.avatarInitials"', '"system.settings.users.update.avatar_initials"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.avatarInitials"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.avatarInitialsPlaceholder"', '"system.settings.users.update.avatar_initials_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.avatarInitialsPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.copyIdpCode"', '"system.settings.users.update.copy_idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.copyIdpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.copyIdpName"', '"system.settings.users.update.copy_idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.copyIdpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.copyIdpOwner"', '"system.settings.users.update.copy_idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.copyIdpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.displayName"', '"system.settings.users.update.display_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.displayName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.displayNamePlaceholder"', '"system.settings.users.update.display_name_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.displayNamePlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.emailPlaceholder"', '"system.settings.users.update.email_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.emailPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.emailVerified"', '"system.settings.users.update.email_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.emailVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.idpCode"', '"system.settings.users.update.idp_code"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.idpCode"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.idpName"', '"system.settings.users.update.idp_name"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.idpName"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.idpOrg"', '"system.settings.users.update.idp_org"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.idpOrg"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.idpOwner"', '"system.settings.users.update.idp_owner"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.idpOwner"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.idpUsername"', '"system.settings.users.update.idp_username"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.idpUsername"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.isActive"', '"system.settings.users.update.is_active"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.isActive"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.isAdmin"', '"system.settings.users.update.is_admin"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.isAdmin"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.isVerified"', '"system.settings.users.update.is_verified"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.isVerified"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.rolesPlaceholder"', '"system.settings.users.update.roles_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.rolesPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.selectColorPlaceholder"', '"system.settings.users.update.select_color_placeholder"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.selectColorPlaceholder"%';
UPDATE public.config_entries SET type_config = replace(type_config, '"system.settings.users.update.unsavedChanges"', '"system.settings.users.update.unsaved_changes"'), updated_by = 'migration-i18n-key-snake-cleanup' WHERE type_config LIKE '%"system.settings.users.update.unsavedChanges"%';
UPDATE public.role_mappings SET label_key = 'system.roles.test_role', updated_by = 'migration-i18n-key-snake-cleanup' WHERE uuid = '9239baae-ebba-4b5c-abc1-f05500c946ac' AND label_key = 'system.roles.testRole';
-- === dangling source literal: app.common.select_time (sibling of select_date) ===
INSERT INTO public.translations ("key","language","value","created_at","created_by","updated_at","updated_by","version") VALUES
  ('app.common.select_time', 'en-GB', 'Select time', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'en-US', 'Select time', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'it-IT', 'Seleziona orario', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'fr-FR', 'Sélectionner une heure', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'es-ES', 'Seleccionar hora', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'de-DE', 'Uhrzeit auswählen', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1),
  ('app.common.select_time', 'pt-PT', 'Selecionar hora', now(), 'migration-i18n-key-snake-cleanup', now(), 'migration-i18n-key-snake-cleanup', 1)
ON CONFLICT ("key","language") WHERE "deleted_at" IS NULL DO NOTHING;
-- === CHECK constraints (last — validates already-clean data) ===
ALTER TABLE public.translations ADD CONSTRAINT translations_key_shape CHECK ("key" ~ '^app(\.[a-z0-9_]+)+$');
ALTER TABLE system.translations ADD CONSTRAINT translations_key_shape CHECK ("key" ~ '^system(\.[a-z0-9_]+)+$');
ALTER TABLE custom.translations ADD CONSTRAINT translations_key_shape CHECK ("key" ~ '^custom(\.[a-z0-9_]+)+$');
-- /tx
