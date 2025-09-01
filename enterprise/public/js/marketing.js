// Extracted from marketing.html and enhanced for accessibility & robustness
// Demo animation - Fixed duplicate declaration issue
        const messages = [
            "Jeg fant en feil i KPI-formelen i 'Q4_Sales_Report.xlsx' - revenue per customer var feil beregnet. Har rettet opp og oppdatert dashbordet.",
            "Du har møte med TechCorp i morgen kl 10. Jeg ser også at nye kunde InnoStart ligger på ruten, og Global Industries (som har  nedgang) kan besøkes samme dag. Skal jeg omorganisere?",
            "Acme Corp ba nettopp om oppdaterte tall på CloudPlatform-salget. Har laget draft-svar med Q4-rapporten - vil du sende den eller gjøre endringer først?",
            "Dagens levering til Nordic Systems mangler ServerRack-komponenter. Har opprettet bestilling, informert kunden om backup-løsning og ny leveringsdato 15. desember.",
            "Navi oppdaget at 3 kunder har samme behov som du løste for MegaCorp i går. Skal jeg lage tilbud til dem basert på samme løsning?"
        ];

        const userResponses = [
            "Perfekt! Send den til Nordic Industries.",
            "Hvorfor prioriterer Navi akkurat disse signalene?", 
            "Kan du vise meg hele rapporten først?",
            "Ja, gjør det. Lag også en påminnelse for oppfølging.",
            "Hvordan lærer WorkBuoy mine arbeidsrutiner?"
        ];

        let messageIndex = 0;
        const demoContent = document.getElementById('demoContent');
        const typing = document.getElementById('typing');

        function addMessage() {
            if (messageIndex >= messages.length) {
                messageIndex = 0;
                // Reset demo
                const messagesToRemove = demoContent.querySelectorAll('.message:nth-child(n+4)');
                messagesToRemove.forEach(msg => msg.remove());
                setTimeout(addMessage, 2000);
                return;
            }

            // Show typing
            typing.style.display = 'flex';
            demoContent.scrollTop = demoContent.scrollHeight;

            setTimeout(() => {
                // Hide typing
                typing.style.display = 'none';
                
                // Add AI message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                messageDiv.innerHTML = `
                    <div class="message-avatar ai-avatar">B</div>
                    <div class="message-bubble">${messages[messageIndex]}</div>
                `;
                demoContent.insertBefore(messageDiv, typing);
                
                demoContent.scrollTop = demoContent.scrollHeight;
                
                // Add user response after delay
                setTimeout(() => {
                    const userMessage = document.createElement('div');
                    userMessage.className = 'message user';
                    userMessage.innerHTML = `
                        <div class="message-avatar user-avatar">Du</div>
                        <div class="message-bubble">${userResponses[messageIndex % userResponses.length]}</div>
                    `;
                    demoContent.insertBefore(userMessage, typing);
                    demoContent.scrollTop = demoContent.scrollHeight;
                    
                    // Add follow-up response for platform questions
                    if (userResponses[messageIndex % userResponses.length].includes('prioriterer') || 
                        userResponses[messageIndex % userResponses.length].includes('lærer')) {
                        setTimeout(() => {
                            typing.style.display = 'flex';
                            demoContent.scrollTop = demoContent.scrollHeight;
                            
                            setTimeout(() => {
                                typing.style.display = 'none';
                                
                                let followUp = '';
                                if (userResponses[messageIndex % userResponses.length].includes('prioriterer')) {
                                    followUp = 'Navi bruker din arbeidskontext, historikk og bedriftsmål til scoring. Nordic Industries får høy score fordi: 1) Du jobber med lignende kunder nå (+0.15), 2) De har €2M potensial, 3) Timing matcher din møtekalender. Du kan justere vektingen i innstillingene.';
                                } else if (userResponses[messageIndex % userResponses.length].includes('lærer')) {
                                    followUp = 'WorkBuoy lærer av dine handlinger: hvilke signaler du handler på, når på dagen du er mest produktiv, hvilke kunder du prioriterer. Hver gang du gir feedback (✅ ❌ 🫰) justerer Navi vektingen. Over tid reduseres støy og relevansen øker med 40-.';
                                }
                                
                                const followUpDiv = document.createElement('div');
                                followUpDiv.className = 'message';
                                followUpDiv.innerHTML = `
                                    <div class="message-avatar ai-avatar">B</div>
                                    <div class="message-bubble">${followUp}</div>
                                `;
                                demoContent.insertBefore(followUpDiv, typing);
                                demoContent.scrollTop = demoContent.scrollHeight;
                            }, 1500);
                        }, 1000);
                    }
                    
                    messageIndex++;
                    setTimeout(addMessage, 4000);
                }, 1000);
            }, 2000);
        }

        // Navi Mode Selector
        const modeDescriptions = {
            usynlig: {
                title: "Usynlig Modus",
                description: "WorkBuoy observerer dine arbeidsrutiner og lærer i bakgrunnen uten å avbryte din arbeidsflyt. Perfekt for oppstart og tilvenning.",
                features: ["Stille datainnsamling", "Mønstergjenkjenning", "Nullforstyrrelse", "Grunnleggende sikkerhet"]
            },
            passiv: {
                title: "Passiv Modus", 
                description: "Systemet overvåker aktivt og bygger profil av dine arbeidsmønstre. Gir deg innsikt uten å gripe inn i prosessene dine.",
                features: ["Aktiv overvåking", "Intelligent analyse", "Diskrete varsler", "Trendrapporter"]
            },
            aktiv: {
                title: "Aktiv Modus",
                description: "Buoy kommer med forslag og hjelper deg proaktivt. AI-assistenten deltar aktivt i arbeidsstrømmen din med smarte anbefalinger.",
                features: ["Proaktive forslag", "Intelligente varslinger", "Kontekstuell hjelp", "Automatiske oppfølginger"]
            },
            kraken: {
                title: "Kraken Modus",
                description: "Omfattende automatisering på tvers av systemer. WorkBuoy tar kontroll over rutineoppgaver og optimaliserer arbeidsstrømmer automatisk.",
                features: ["Massiv automasjon", "Tverrsystem-integrasjon", "Proaktiv problemløsing", "Avanserte workflows"]
            },
            tsunami: {
                title: "Tsunami Modus", 
                description: "Full automasjon med minimal menneskelig tilsyn. Systemet håndterer komplekse forretningsprosesser autonomt og rapporterer kun unntak.",
                features: ["Autonom operasjon", "Minimal tilsyn", "Selvkorrigerende", "Enterprise-skalering"]
            }
        };

        function updateModeDescription(mode) {
            const description = modeDescriptions[mode];
            const descElement = document.getElementById('modeDescription');
            
            const featuresHTML = description.features.map(feature => 
                `<div class="mode-feature">${feature}</div>`
            ).join('');
            
            descElement.innerHTML = `
                <h3>${description.title}</h3>
                <p>${description.description}</p>
                <div class="mode-features">${featuresHTML}</div>
            `;
        }

        // Mode step click handlers
        document.querySelectorAll('.mode-step').forEach(step => {
            step.addEventListener('click', () => {
                // Remove active class from all steps
                document.querySelectorAll('.mode-step').forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked step
                step.classList.add('active');
                
                // Update description
                const mode = step.getAttribute('data-mode');
                updateModeDescription(mode);
            });
        });

        // Start demo animation
        setTimeout(addMessage, 3000);
