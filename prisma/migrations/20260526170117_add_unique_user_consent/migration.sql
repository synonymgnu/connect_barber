-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_userId_consentType_key" ON "UserConsent"("userId", "consentType");
