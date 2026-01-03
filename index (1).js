require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

const {
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

let controlPanelMessageId = null;
let botStatusMessageId = null;
const spamProtection = new Collection();
const SPAM_TIME = 3000;

client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج'
    ];
    
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000);
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    await createControlPanel();
    await createBotStatusEmbed();
    
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000);
});

async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) await channel.bulkDelete(messages);
        
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true')
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true')
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) await channel.bulkDelete(messages);
        
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true')
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) return true;
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false;
}

async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
                const memberForReport = await interaction.guild.members.fetch(interaction.user.id);
                if (!memberForReport.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
            case 'add_note':
                const fullMember = await interaction.guild.members.fetch(interaction.user.id);
                if (!fullMember.roles.cache.has(ADD_NOTE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }

                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');
                
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
                        {
                            name: '👤 مسؤول التقرير',
                            value: `<@${interaction.user.id}>`,
                            inline: false
                        },
                        {
                            name: '🕒 وقت التقرير',
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                            inline: true
                        },
                        {
                            name: '📝 البيانات',
                            value: reportMessage.substring(0, 1024),
                            inline: false
                        }
                    )
                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
                await logAction('إرسال تقرير عضو', interaction.user, {
                    'محتوى التقرير': reportMessage.substring(0, 200),
                    'العضو المستهدف': `<@${interaction.user.id}>`
                }, interaction.user);

                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📝 ملاحظة جديدة على عضو')
                    .setDescription('**تم إضافة ملاحظة جديدة**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
                        { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
                        { name: '📝 السبب', value: noteReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
                        { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                await logAction('إضافة ملاحظة', interaction.user, {
                    'التاريخ': noteDate,
                    'السبب': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
                    ephemeral: true 
                });
                break;

            case 'grant_privilege_modal':
                const privilegeDate = interaction.fields.getTextInputValue('privilege_date');
                const privilegeUserId = interaction.fields.getTextInputValue('privilege_user_id');
                const privilegeReason = interaction.fields.getTextInputValue('privilege_reason');
                
                let privilegeTargetMember;
                try {
                    privilegeTargetMember = await interaction.guild.members.fetch(privilegeUserId);
                } catch {
                    privilegeTargetMember = null;
                }
                
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⭐ إمتياز جديد')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: '👤 العضو', value: privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`, inline: false },
                        { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
                        { name: '📝 السبب', value: privilegeReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
                        { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                await logAction('منح إمتياز', interaction.user, {
                    'التاريخ': privilegeDate,
                    'السبب': privilegeReason.substring(0, 200),
                    'العضو المستهدف': privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`
                }, privilegeTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم منح الإمتياز بنجاح!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة المودال:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة البيانات!**', 
            ephemeral: true 
        });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    
    const COMMAND_ROLE_ID = '1455328577783468185';
    const COMMAND_LOG_CHANNEL_ID = '1456111431630979113';

    if (message.content.startsWith('!clear')) {
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (!amount || isNaN(amount)) {
            return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
        }

        if (amount < 1 || amount > 100) {
            return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
        }

        try {
            await message.channel.bulkDelete(amount + 1, true);
            const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
            setTimeout(() => reply.delete(), 3000);

            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🧹 أمر !clear')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في مسح الرسائل:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }

    if (message.content.startsWith('!say')) {
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const content = message.content.slice(5).trim();
        if (!content) {
            return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
        }

        try {
            await message.delete();
            await message.channel.send({ content: content });

            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('📢 أمر !say')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('❌ خطأ في إرسال الرسالة:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }

    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }

    if (message.content.startsWith('!tag')) {
        if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const member = message.mentions.members.first();
        const newName = message.content.split(' ').slice(2).join(' ');

        if (!member || !newName) {
            return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
        }

        try {
            const oldName = member.nickname || member.user.username;
            await member.setNickname(newName);

            const sentMsg = await message.reply(
                `✅ **تم تغيير الاسم بنجاح**\n` +
                `👤 ${member.user.tag}\n` +
                `✏️ ${oldName} ➜ ${newName}`
            );

            setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

            const logChannel = await message.client.channels.fetch(
                process.env.TAG_LOG_CHANNEL_ID
            );

            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🏷️ أمر !tag')
                    .setColor(0x3498DB)
                    .addFields(
                        { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                        { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                        { name: '✏️ الاسم القديم', value: oldName, inline: false },
                        { name: '🆕 الاسم الجديد', value: newName, inline: false },
                        { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في أمر !tag:', error);
            const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
            setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

const {
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

let controlPanelMessageId = null;
let botStatusMessageId = null;
const spamProtection = new Collection();
const SPAM_TIME = 3000;

client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    console.log(`👥 موجود في ${client.guilds.cache.size} سيرفر`);
    
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج',
        'مشغول الان',
        'اتمني لا توجهون مشاكل'
    ];
    
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000);
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    await createControlPanel();
    await createBotStatusEmbed();
    
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000);
});

async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) await channel.bulkDelete(messages);
        
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true')
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true')
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) await channel.bulkDelete(messages);
        
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true')
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) return true;
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false;
}

async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
                const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
            case 'add_note':
                const fullMember = await interaction.guild.members.fetch(interaction.user.id);
                if (!fullMember.roles.cache.has(ADD_NOTE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }

                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');
                const targetMember = member;
                
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
                        {
                            name: '👤 مسؤول التقرير',
                            value: `<@${interaction.user.id}>`,
                            inline: false
                        },
                        {
                            name: '🕒 وقت التقرير',
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                            inline: true
                        },
                        {
                            name: '📝 البيانات',
                            value: reportMessage.substring(0, 1024),
                            inline: false
                        }
                    )
                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
                await logAction('إرسال تقرير عضو', interaction.user, {
                    'محتوى التقرير': reportMessage.substring(0, 200),
                    'العضو المستهدف': `<@${interaction.user.id}>`
                }, interaction.user);

                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📝 ملاحظة جديدة على عضو')
                    .setDescription('**تم إضافة ملاحظة جديدة**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
                        { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
                        { name: '📝 السبب', value: noteReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
                        { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                await logAction('إضافة ملاحظة', interaction.user, {
                    'التاريخ': noteDate,
                    'السبب': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
                    ephemeral: true 
                });
                break;

            case 'grant_privilege_modal':
                const privilegeDate = interaction.fields.getTextInputValue('privilege_date');
                const privilegeUserId = interaction.fields.getTextInputValue('privilege_user_id');
                const privilegeReason = interaction.fields.getTextInputValue('privilege_reason');
                
                let privilegeTargetMember;
                try {
                    privilegeTargetMember = await interaction.guild.members.fetch(privilegeUserId);
                } catch {
                    privilegeTargetMember = null;
                }
                
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⭐ إمتياز جديد')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: '👤 العضو', value: privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`, inline: false },
                        { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
                        { name: '📝 السبب', value: privilegeReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
                        { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                await logAction('منح إمتياز', interaction.user, {
                    'التاريخ': privilegeDate,
                    'السبب': privilegeReason.substring(0, 200),
                    'العضو المستهدف': privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`
                }, privilegeTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم منح الإمتياز بنجاح!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة المودال:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة البيانات!**', 
            ephemeral: true 
        });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    
    // أوامر الدردشة
    const COMMAND_ROLE_ID = '1455328577783468185';
    const COMMAND_LOG_CHANNEL_ID = '1456111431630979113';

    if (message.content.startsWith('!clear')) {
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (!amount || isNaN(amount)) {
            return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
        }

        if (amount < 1 || amount > 100) {
            return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
        }

        try {
            await message.channel.bulkDelete(amount + 1, true);
            const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
            setTimeout(() => reply.delete(), 3000);

            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🧹 أمر !clear')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في مسح الرسائل:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }

    if (message.content.startsWith('!say')) {
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const content = message.content.slice(5).trim();
        if (!content) {
            return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
        }

        try {
            await message.delete();
            await message.channel.send({ content: content });

            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('📢 أمر !say')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('❌ خطأ في إرسال الرسالة:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }

    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }

    if (message.content.startsWith('!tag')) {
        if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const member = message.mentions.members.first();
        const newName = message.content.split(' ').slice(2).join(' ');

        if (!member || !newName) {
            return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
        }

        try {
            const oldName = member.nickname || member.user.username;
            await member.setNickname(newName);

            const sentMsg = await message.reply(
                `✅ **تم تغيير الاسم بنجاح**\n` +
                `👤 ${member.user.tag}\n` +
                `✏️ ${oldName} ➜ ${newName}`
            );

            setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

            const logChannel = await message.client.channels.fetch(
                process.env.TAG_LOG_CHANNEL_ID
            );

            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🏷️ أمر !tag')
                    .setColor(0x3498DB)
                    .addFields(
                        { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                        { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                        { name: '✏️ الاسم القديم', value: oldName, inline: false },
                        { name: '🆕 الاسم الجديد', value: newName, inline: false },
                        { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في أمر !tag:', error);
            const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
            setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

// تعريف جميع القنوات والرتب من ملف .env
const {
    // القنوات الأساسية
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    
    // قنوات التقارير (منفصلة)
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    
    // الرتب
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

// متغيرات لتخزين معرفات الرسائل
let controlPanelMessageId = null;
let botStatusMessageId = null;

// أنتي سبام للتفاعلات
const spamProtection = new Collection();
const SPAM_TIME = 3000; // 3 ثواني بين كل استخدام

// حدث عند جاهزية البوت
client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    console.log(`👥 موجود في ${client.guilds.cache.size} سيرفر`);
    

        // تعيين نشاط البوت المتغير
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج',
        'مشغول الان',
        'اتمني لا توجهون مشاكل'
    ];
    
    // تغيير النشاط كل 30 ثانية
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        
        // الانتقال للنشاط التالي
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000); // 30 ثانية
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    

    
    // إنشاء لوحة التحكم
    await createControlPanel();
    
    // إنشاء إمبد حالة البوت
    await createBotStatusEmbed();
    
    // تحديث حالة البوت كل 3 دقائق
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000); // 3 دقائق = 180000 مللي ثانية
});

// دالة لإنشاء لوحة التحكم
async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إنشاء إمبد للوحة التحكم مع صورة
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true') // صورة لوحة التحكم
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true') // صورة بانر للوحة التحكم
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        // إنشاء أزرار اللوحة
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        // إرسال اللوحة وحفظ معرف الرسالة
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

// دالة لإنشاء إمبد حالة البوت
async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إرسال الإمبد الأولي وحفظ المعرف
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

// دالة لتحديث إمبد حالة البوت
async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حساب إحصائيات البوت
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        // تنسيق الوقت
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        // إنشاء إمبد حالة البوت مع صورة
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
         .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false  },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false  },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false  },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false  },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true') // صورة بانر للحالة
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        // تحديث الرسالة أو إنشاء جديدة
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

// دالة للتحقق من الأنتي سبام
function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) {
            return true; // سبام
        }
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false; // ليس سبام
}

// دالة لتسجيل اللوج
async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        // إضافة تفاصيل إضافية
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

// حدث عند التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    // التحقق من الأنتي سبام
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
                const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                // تسجيل اللوج
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
            case 'add_note':
                // جلب العضو الكامل للتأكد من الرتب
                const fullMember = await interaction.guild.members.fetch(interaction.user.id);

                if (!fullMember.roles.cache.has(process.env.ADD_NOTE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }

                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

// حدث عند إرسال المودال
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');

                // محاولة الحصول على العضو
                const targetMember = member;
                
                // إرسال التقرير في قناة تقارير الإعضاء المنفصلة
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
                        {
                            name: '👤 مسؤول التقرير',
                            value: `<@${interaction.user.id}>`,
                            inline: false
                        },
                        {
                            name: '🕒 وقت التقرير',
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                            inline: true
                        },
                        {
                            name: '📝 البيانات',
                            value: reportMessage.substring(0, 1024),
                            inline: false
                        }
                    )
                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
                // تسجيل اللوج
                await logAction('إرسال تقرير عضو', interaction.user, {
                    'محتوى التقرير': reportMessage.substring(0, 200),
                    'العضو المستهدف': `<@${interaction.user.id}>`
                }, interaction.user);

                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                // إرسال التقرير في قناة تقارير اللجنة المنفصلة
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                // تسجيل اللوج
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
                // إرسال الملاحظة
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📝 ملاحظة جديدة على عضو')
                    .setDescription('**تم إضافة ملاحظة جديدة**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
                        { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
                        { name: '📝 السبب', value: noteReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
                        { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                // تسجيل اللوج
                await logAction('إضافة ملاحظة', interaction.user, {
                    'التاريخ': noteDate,
                    'السبب': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
                    ephemeral: true 
                });
                break;

            case 'grant_privilege_modal':
                const privilegeDate = interaction.fields.getTextInputValue('privilege_date');
                const privilegeUserId = interaction.fields.getTextInputValue('privilege_user_id');
                const privilegeReason = interaction.fields.getTextInputValue('privilege_reason');
                
                let privilegeTargetMember;
                try {
                    privilegeTargetMember = await interaction.guild.members.fetch(privilegeUserId);
                } catch {
                    privilegeTargetMember = null;
                }
                
                // إرسال الإمتياز
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⭐ إمتياز جديد')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: '👤 العضو', value: privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`, inline: false },
                        { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
                        { name: '📝 السبب', value: privilegeReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
                        { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                // تسجيل اللوج
                await logAction('منح إمتياز', interaction.user, {
                    'التاريخ': privilegeDate,
                    'السبب': privilegeReason.substring(0, 200),
                    'العضو المستهدف': privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`
                }, privilegeTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم منح الإمتياز بنجاح!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة المودال:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة البيانات!**', 
            ephemeral: true 
        });
    }
});

// أوامر الدردشة التقليدية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // الأنتي سبام للأوامر
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    

    // الرتبة المشتركة لكل الأوامر
    const COMMAND_ROLE_ID = '1455328577783468185'; // الرتبة اللي تقدر تستخدم !say و !clear
    const COMMAND_LOG_CHANNEL_ID = '1456111431630979113'; // قناة اللوج

    // الأمر !clear
    if (message.content.startsWith('!clear')) {
        // التحقق من الصلاحية
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (!amount || isNaN(amount)) {
            return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
        }

        if (amount < 1 || amount > 100) {
            return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
        }

        try {
            await message.channel.bulkDelete(amount + 1, true);

            const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
            setTimeout(() => reply.delete(), 3000);

            // تسجيل اللوج
            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🧹 أمر !clear')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في مسح الرسائل:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }

    // الأمر !say
    if (message.content.startsWith('!say')) {
        // التحقق من الصلاحية
        if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const content = message.content.slice(5).trim();
        if (!content) {
            return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
        }

        try {
            await message.delete();
            await message.channel.send({ content: content });

            // تسجيل اللوج
            const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('📢 أمر !say')
                    .addFields(
                        { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                        { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('❌ خطأ في إرسال الرسالة:', error);
            message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
        }
    }
    

    // الأمر !refresh
    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            
            // تسجيل اللوج
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    // الأمر !status
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }


    // ===== أمر !tag تغيير الاسم =====
    if (message.content.startsWith('!tag')) {
        // التحقق من الصلاحية
        if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
        }

        const member = message.mentions.members.first();
        const newName = message.content.split(' ').slice(2).join(' ');

        if (!member || !newName) {
            return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
        }

        try {
            const oldName = member.nickname || member.user.username;

            await member.setNickname(newName);

            // إرسال رسالة الرد وحفظها في متغير
            const sentMsg = await message.reply(
                `✅ **تم تغيير الاسم بنجاح**\n` +
                `👤 ${member.user.tag}\n` +
                `✏️ ${oldName} ➜ ${newName}`
            );

            // مسح الرسالة بعد 3 ثواني (3000 ملي ثانية)
            setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

            // تسجيل اللوج
            const logChannel = await message.client.channels.fetch(
                process.env.TAG_LOG_CHANNEL_ID
            );

            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🏷️ أمر !tag')
                    .setColor(0x3498DB)
                    .addFields(
                        { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                        { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                        { name: '✏️ الاسم القديم', value: oldName, inline: false },
                        { name: '🆕 الاسم الجديد', value: newName, inline: false },
                        { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ خطأ في أمر !tag:', error);
            const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
            // مسح رسالة الخطأ بعد 3 ثواني كمان
            setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
        }
    }
});

// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);​require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

// طھط¹ط±ظٹظپ ط¬ظ…ظٹط¹ ط§ظ„ظ‚ظ†ظˆط§طھ ظˆط§ظ„ط±طھط¨ ظ…ظ† ظ…ظ„ظپ .env
const {
    // ط§ظ„ظ‚ظ†ظˆط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    
    // ظ‚ظ†ظˆط§طھ ط§ظ„طھظ‚ط§ط±ظٹط± (ظ…ظ†ظپطµظ„ط©)
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    
    // ط§ظ„ط±طھط¨
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

// ظ…طھط؛ظٹط±ط§طھ ظ„طھط®ط²ظٹظ† ظ…ط¹ط±ظپط§طھ ط§ظ„ط±ط³ط§ط¦ظ„
let controlPanelMessageId = null;
let botStatusMessageId = null;

// ط£ظ†طھظٹ ط³ط¨ط§ظ… ظ„ظ„طھظپط§ط¹ظ„ط§طھ
const spamProtection = new Collection();
const SPAM_TIME = 3000; // 3 ط«ظˆط§ظ†ظٹ ط¨ظٹظ† ظƒظ„ ط§ط³طھط®ط¯ط§ظ…

// ط­ط¯ط« ط¹ظ†ط¯ ط¬ط§ظ‡ط²ظٹط© ط§ظ„ط¨ظˆطھ
client.once('ready', async () => {
    console.log(`âœ… ط§ظ„ط¨ظˆطھ ${client.user.tag} ظٹط¹ظ…ظ„ ط§ظ„ط¢ظ†!`);
    console.log(`ًں‘¥ ظ…ظˆط¬ظˆط¯ ظپظٹ ${client.guilds.cache.size} ط³ظٹط±ظپط±`);
    

        // طھط¹ظٹظٹظ† ظ†ط´ط§ط· ط§ظ„ط¨ظˆطھ ط§ظ„ظ…طھط؛ظٹط±
    const activities = [
        'ظƒط±ط§ط¬ ط§ظ„ظ…ظٹظƒط§ظ†ظٹظƒظٹ',
        'ط§ظ†ط§ ظپظٹ ط®ط¯ظ…طھظƒظ…', 
        'ظٹط¹ظ…ظ„ ظ…ط¯ظٹط± ط§ظ„ظƒط±ط§ط¬',
        'ظ…ط´ط؛ظˆظ„ ط§ظ„ط§ظ†',
        'ط§طھظ…ظ†ظٹ ظ„ط§ طھظˆط¬ظ‡ظˆظ† ظ…ط´ط§ظƒظ„'
    ];
    
    // طھط؛ظٹظٹط± ط§ظ„ظ†ط´ط§ط· ظƒظ„ 30 ط«ط§ظ†ظٹط©
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        
        // ط§ظ„ط§ظ†طھظ‚ط§ظ„ ظ„ظ„ظ†ط´ط§ط· ط§ظ„طھط§ظ„ظٹ
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000); // 30 ط«ط§ظ†ظٹط©
    
    console.log('âœ… طھظ… طھظپط¹ظٹظ„ ط§ظ„ط£ظ†ط´ط·ط© ط§ظ„ظ…طھط؛ظٹط±ط© ظ„ظ„ط¨ظˆطھ');
    

    
    // ط¥ظ†ط´ط§ط، ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…
    await createControlPanel();
    
    // ط¥ظ†ط´ط§ط، ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ
    await createBotStatusEmbed();
    
    // طھط­ط¯ظٹط« ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ ظƒظ„ 3 ط¯ظ‚ط§ط¦ظ‚
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('â‌Œ ط®ط·ط£ ظپظٹ طھط­ط¯ظٹط« ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ:', error);
        }
    }, 180000); // 3 ط¯ظ‚ط§ط¦ظ‚ = 180000 ظ…ظ„ظ„ظٹ ط«ط§ظ†ظٹط©
});

// ط¯ط§ظ„ط© ظ„ط¥ظ†ط´ط§ط، ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…
async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        
        // ط­ط°ظپ ط§ظ„ط±ط³ط§ط¦ظ„ ط§ظ„ظ‚ط¯ظٹظ…ط© ظپظٹ ط§ظ„ظ‚ظ†ط§ط©
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // ط¥ظ†ط´ط§ط، ط¥ظ…ط¨ط¯ ظ„ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ظ…ط¹ طµظˆط±ط©
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('ًں›‘ ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ًں›‘')
            .setDescription('**ظٹظ…ظƒظ†ظƒ ط¥ط®طھظٹط§ط± ط§ظ„ط²ط± ط§ظ„ظ…ظ†ط§ط³ط¨ ظ„ظ„ظ‚ظٹط§ظ… ط¨ظ€ ظ…ظ‡ط§ظ…ظƒ ط§ظ„ظ…ط·ظ„ظˆط¨ط© :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true') // طµظˆط±ط© ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…
            .addFields(
                { name: 'ًں“‹ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ط¥ط¹ط¶ط§ط،', value: 'ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظ‰ ظ„ظ€ ظ…ط³ط¤ظˆظ„ ط§ظ„ط¥ط¹ط¶ط§ط، ', inline: false },
                { name: 'ًں‘¥ ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ظ„ط¬ظ†ط©', value: 'ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظ‰ ظ„ظ€ ظ…ط³ط¤ظˆظ„ ط§ظ„ظ„ط¬ظ†ط©', inline: false },
                { name: 'ًں“‌ ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ', value: 'طھط³ط¬ظٹظ„ ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ ', inline: false },
                { name: 'â­گ ط§ظ„ط¥ظ…طھظٹط§ط²ط§طھ', value: 'طھط³ط¬ظٹظ„ ط§ظ„ط¥ظ…طھظٹط§ط²ط§طھ', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true') // طµظˆط±ط© ط¨ط§ظ†ط± ظ„ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        // ط¥ظ†ط´ط§ط، ط£ط²ط±ط§ط± ط§ظ„ظ„ظˆط­ط©
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ط¥ط¹ط¶ط§ط،')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('ًں“‹'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ظ„ط¬ظ†ط©')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('ًں‘¥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('ًں“‌'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('ط§ظ„ط¥ظ…طھظٹط§ط²ط§طھ')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('â­گ'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' طھط­ط¯ظٹط« ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('ًں”„')
            );
        
        // ط¥ط±ط³ط§ظ„ ط§ظ„ظ„ظˆط­ط© ظˆط­ظپط¸ ظ…ط¹ط±ظپ ط§ظ„ط±ط³ط§ظ„ط©
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('âœ… طھظ… ط¥ظ†ط´ط§ط، ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ط¨ظ†ط¬ط§ط­!');
        
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ط¥ظ†ط´ط§ط، ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…:', error);
    }
}

// ط¯ط§ظ„ط© ظ„ط¥ظ†ط´ط§ط، ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ
async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // ط­ط°ظپ ط§ظ„ط±ط³ط§ط¦ظ„ ط§ظ„ظ‚ط¯ظٹظ…ط© ظپظٹ ط§ظ„ظ‚ظ†ط§ط©
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // ط¥ط±ط³ط§ظ„ ط§ظ„ط¥ظ…ط¨ط¯ ط§ظ„ط£ظˆظ„ظٹ ظˆط­ظپط¸ ط§ظ„ظ…ط¹ط±ظپ
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ط¥ظ†ط´ط§ط، ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ:', error);
    }
}

// ط¯ط§ظ„ط© ظ„طھط­ط¯ظٹط« ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ
async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // ط­ط³ط§ط¨ ط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ط¨ظˆطھ
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        // طھظ†ط³ظٹظ‚ ط§ظ„ظˆظ‚طھ
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days} ظٹظˆظ… ${hours} ط³ط§ط¹ط© ${minutes} ط¯ظ‚ظٹظ‚ط© ${seconds} ط«ط§ظ†ظٹط©`;
        
        // ط¥ظ†ط´ط§ط، ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ ظ…ط¹ طµظˆط±ط©
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' ط­ط§ظ„ط© ط§ظ„ظ†ط¸ط§ظ… ًں¤–')
            .setDescription('**ظ…ط¹ظ„ظˆظ…ط§طھ ظˆط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ظ†ط¸ط§ظ… **')
         .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: 'ًں“ٹ ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ', value: `ط§ظ„ط³ظٹط±ظپط±ط§طھ: **${guilds}**\nط§ظ„ط£ط¹ط¶ط§ط،: **${users}**`, inline: false  },
                { name: 'âڑ، ط§ظ„ط£ط¯ط§ط،', value: `**${ping}ms**\nظˆظ‚طھ ط§ظ„طھط´ط؛ظٹظ„: **${uptimeString}**`, inline: false  },
                { name: 'ًں“… ط¢ط®ط± طھط­ط¯ظٹط«', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false  },
                { name: 'ًںں¢ : ط§ظ„ط­ط§ظ„ط©', value: '**âœ… ط§ظ„ظ†ط¸ط§ظ… ظٹط¹ظ…ظ„ ط¨ط´ظƒظ„ ط·ط¨ظٹط¹ظٹ**', inline: true },
                { name: 'ًں’¾ ط§ظ„ط°ط§ظƒط±ط©', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false  },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true') // طµظˆط±ط© ط¨ط§ظ†ط± ظ„ظ„ط­ط§ظ„ط©
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        // طھط­ط¯ظٹط« ط§ظ„ط±ط³ط§ظ„ط© ط£ظˆ ط¥ظ†ط´ط§ط، ط¬ط¯ظٹط¯ط©
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ طھط­ط¯ظٹط« ط¥ظ…ط¨ط¯ ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ:', error);
    }
}

// ط¯ط§ظ„ط© ظ„ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط£ظ†طھظٹ ط³ط¨ط§ظ…
function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) {
            return true; // ط³ط¨ط§ظ…
        }
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false; // ظ„ظٹط³ ط³ط¨ط§ظ…
}

// ط¯ط§ظ„ط© ظ„طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('ًں“‌ ط³ط¬ظ„ ط§ظ„ظ†ط¸ط§ظ…')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: 'ًں‘¤ ط§ظ„ظ…ط³طھط®ط¯ظ…', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: 'ًں•’ ط§ظ„ظˆظ‚طھ', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: 'ًں†” ط§ظ„ظ…ط¹ط±ظپ', value: user.id, inline: true }
            )
            .setTimestamp();
        
        // ط¥ط¶ط§ظپط© طھظپط§طµظٹظ„ ط¥ط¶ط§ظپظٹط©
        if (targetUser) {
            logEmbed.addFields({ 
                name: 'ًںژ¯ ط§ظ„ط¹ط¶ظˆ ط§ظ„ظ…ط³طھظ‡ط¯ظپ', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬:', error);
    }
}

// ط­ط¯ط« ط¹ظ†ط¯ ط§ظ„طھظپط§ط¹ظ„ ظ…ط¹ ط§ظ„ط£ط²ط±ط§ط±
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    // ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط£ظ†طھظٹ ط³ط¨ط§ظ…
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: 'âڑ ï¸ڈ **ط§ظ„ط±ط¬ط§ط، ط§ظ„ط§ظ†طھط¸ط§ط± 3 ط«ظˆط§ظ†ظٹ ط¨ظٹظ† ظƒظ„ ط§ط³طھط®ط¯ط§ظ…!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
  const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: 'â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**', 
                        ephemeral: true 
                    });
                }
                
                // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
                await logAction('ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± طھظ‚ط±ظٹط± ط§ظ„ط¹ط¶ظˆ', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('ًں“‹ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ط¥ط¹ط¶ط§ط،');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('ط±ط³ط§ظ„ط© ط§ظ„طھظ‚ط±ظٹط±')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('ط§ظƒطھط¨ ظ…ط­طھظˆظ‰ ط§ظ„طھظ‚ط±ظٹط± ظ‡ظ†ط§...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: 'â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± طھظ‚ط±ظٹط± ط§ظ„ظ„ط¬ظ†ط©', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('ًں‘¥ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ظ„ط¬ظ†ط©');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('ظ…ط­طھظˆظ‰ طھظ‚ط±ظٹط± ط§ظ„ظ„ط¬ظ†ط©')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('ط§ظƒطھط¨ طھظ‚ط±ظٹط± ط§ظ„ظ„ط¬ظ†ط© ظ‡ظ†ط§...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
case 'add_note':
    // ط¬ظ„ط¨ ط§ظ„ط¹ط¶ظˆ ط§ظ„ظƒط§ظ…ظ„ ظ„ظ„طھط£ظƒط¯ ظ…ظ† ط§ظ„ط±طھط¨
    const fullMember = await interaction.guild.members.fetch(interaction.user.id);

    if (!fullMember.roles.cache.has(process.env.ADD_NOTE_BUTTON_ROLE_ID)) {
        return interaction.reply({ 
            content: 'â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**', 
            ephemeral: true 
        });
    }

                
                await logAction('ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± ط¥ط¶ط§ظپط© ظ…ظ„ط§ط­ط¸ط©', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('ًں“‌ ط¥ط¶ط§ظپط© ظ…ظ„ط§ط­ط¸ط© ط¹ظ„ظ‰ ط¹ط¶ظˆ');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('طھط§ط±ظٹط® ط§ظ„ظ…ظ„ط§ط­ط¸ط©')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('ظ…ط«ط§ظ„: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('ط¢ظٹط¯ظٹ ط§ظ„ط´ط®طµ (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('ط³ط¨ط¨ ط§ظ„ظ…ظ„ط§ط­ط¸ط©')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('ط§ظƒطھط¨ ط³ط¨ط¨ ط§ظ„ظ…ظ„ط§ط­ط¸ط© ظ‡ظ†ط§...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: 'â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± ظ…ظ†ط­ ط¥ظ…طھظٹط§ط²', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('â­گ ظ…ظ†ط­ ط¥ظ…طھظٹط§ط² ظ„ط¹ط¶ظˆ');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('طھط§ط±ظٹط® ط§ظ„ط¥ظ…طھظٹط§ط²')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('ظ…ط«ط§ظ„: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('ط¢ظٹط¯ظٹ ط§ظ„ط´ط®طµ (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('ط³ط¨ط¨ ظ…ظ†ط­ ط§ظ„ط¥ظ…طھظٹط§ط²')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('ط§ظƒطھط¨ ط³ط¨ط¨ ظ…ظ†ط­ ط§ظ„ط¥ظ…طھظٹط§ط² ظ‡ظ†ط§...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(REFRESH_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: 'â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ط¶ط؛ط· ط¹ظ„ظ‰ ط²ط± طھط­ط¯ظٹط« ط§ظ„ظ„ظˆط­ط©', interaction.user);
                
                await interaction.reply({ 
                    content: 'ًں”„ **ط¬ط§ط±ظٹ طھط­ط¯ظٹط« ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: 'âœ… **طھظ… طھط­ط¯ظٹط« ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ط¨ظ†ط¬ط§ط­!**' 
                });
                break;
        }
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ظ…ط¹ط§ظ„ط¬ط© ط§ظ„طھظپط§ط¹ظ„:', error);
        await interaction.reply({ 
            content: 'â‌Œ **ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ظ…ط¹ط§ظ„ط¬ط© ط·ظ„ط¨ظƒ!**', 
            ephemeral: true 
        });
    }
});

// ط­ط¯ط« ط¹ظ†ط¯ ط¥ط±ط³ط§ظ„ ط§ظ„ظ…ظˆط¯ط§ظ„
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');

 // ظ…ط­ط§ظˆظ„ط© ط§ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط§ظ„ط¹ط¶ظˆ
 const targetMember = member;
                
                // ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ط±ظٹط± ظپظٹ ظ‚ظ†ط§ط© طھظ‚ط§ط±ظٹط± ط§ظ„ط¥ط¹ط¶ط§ط، ط§ظ„ظ…ظ†ظپطµظ„ط©
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('ًں“‹ ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ ظ„ظ€ ظ…ط³ط¤ظˆظ„ ط§ظ„ط¥ط¹ط¶ط§ط،')
                    .setDescription('â–¬â–¬â–¬â–¬ ï·½ â–¬â–¬â–¬â–¬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
    {
        name: 'ًں‘¤ ظ…ط³ط¤ظˆظ„ ط§ظ„طھظ‚ط±ظٹط±',
        value: `<@${interaction.user.id}>`,
        inline: false
    },
    {
        name: 'ًں•’ ظˆظ‚طھ ط§ظ„طھظ‚ط±ظٹط±',
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true
    },
    {
        name: 'ًں“‌ ط§ظ„ط¨ظٹط§ظ†ط§طھ',
        value: reportMessage.substring(0, 1024),
        inline: false
    }
)

                    .setFooter({ text: 'ظ†ط¸ط§ظ… ط§ظ„طھظ‚ط§ط±ظٹط± - ط§ظ„ط¥ط¯ط§ط±ط© ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
// طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
await logAction('ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ط¹ط¶ظˆ', interaction.user, {
    'ظ…ط­طھظˆظ‰ ط§ظ„طھظ‚ط±ظٹط±': reportMessage.substring(0, 200),
    'ط§ظ„ط¹ط¶ظˆ ط§ظ„ظ…ط³طھظ‡ط¯ظپ': `<@${interaction.user.id}>`
}, interaction.user);

                
                await interaction.reply({ 
                    content: 'âœ… **طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ط±ظٹط± ط¨ظ†ط¬ط§ط­!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                // ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ط±ظٹط± ظپظٹ ظ‚ظ†ط§ط© طھظ‚ط§ط±ظٹط± ط§ظ„ظ„ط¬ظ†ط© ط§ظ„ظ…ظ†ظپطµظ„ط©
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('ًں‘¥ طھظ‚ط±ظٹط± ظ…ط³ط¤ظˆظ„ ط§ظ„ظ„ط¬ظ†ط©')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: 'ًںڈ›ï¸ڈ ط§ظ„ظ†ظˆط¹', value: 'طھظ‚ط±ظٹط± ظ„ط¬ظ†ط©', inline: true },
                        { name: 'ًں•’ ط§ظ„ظˆظ‚طھ', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: 'ًں“‌ ظ…ظ‚ط¯ظ‘ظ… ط§ظ„طھظ‚ط±ظٹط±', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'ظ†ط¸ط§ظ… ط§ظ„طھظ‚ط§ط±ظٹط± - ظ„ط¬ظ†ط© ط§ظ„ط¥ط¯ط§ط±ط©', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
                await logAction('ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ظ„ط¬ظ†ط©', interaction.user, {
                    'ظ…ط­طھظˆظ‰ ط§ظ„طھظ‚ط±ظٹط±': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: 'âœ… **طھظ… ط¥ط±ط³ط§ظ„ طھظ‚ط±ظٹط± ط§ظ„ظ„ط¬ظ†ط© ط¨ظ†ط¬ط§ط­!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
 

 // ط¥ط±ط³ط§ظ„ ط§ظ„ظ…ظ„ط§ط­ط¸ط©
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('ًں“‌ ظ…ظ„ط§ط­ط¸ط© ط¬ط¯ظٹط¯ط© ط¹ظ„ظ‰ ط¹ط¶ظˆ')
                    .setDescription('**طھظ… ط¥ط¶ط§ظپط© ظ…ظ„ط§ط­ط¸ط© ط¬ط¯ظٹط¯ط©**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: 'ًں“… طھط§ط±ظٹط® ط§ظ„ظ…ظ„ط§ط­ط¸ط©', value: noteDate, inline: true },
                        { name: 'ًں‘¤ ط§ظ„ط¹ط¶ظˆ ط§ظ„ظ…ط¹ظ†ظٹ', value: noteTargetMember ? `<@${noteUserId}>` : `ط¢ظٹط¯ظٹ: ${noteUserId}`, inline: true },
                        { name: 'ًں“‌ ط§ظ„ط³ط¨ط¨', value: noteReason, inline: false },
                        { name: 'ًں‘¤ ط§ظ„ظ…ط³ط¤ظˆظ„', value: `<@${userId}>`, inline: true },
                        { name: 'ًں•’ ظˆظ‚طھ ط§ظ„طھط³ط¬ظٹظ„', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'ظ†ط¸ط§ظ… ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ - ط§ظ„ط¥ط¯ط§ط±ط©', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
                await logAction('ط¥ط¶ط§ظپط© ظ…ظ„ط§ط­ط¸ط©', interaction.user, {
                    'ط§ظ„طھط§ط±ظٹط®': noteDate,
                    'ط§ظ„ط³ط¨ط¨': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `âœ… **طھظ… ط¥ط¶ط§ظپط© ط§ظ„ظ…ظ„ط§ط­ط¸ط© ط¨ظ†ط¬ط§ط­!**`, 
                    ephemeral: true 
                });
                break;

                // =========ط¥ط±ط³ط§ظ„ ط§ظ„ط¥ظ…طھظٹط§ط²
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('â­گ ط¥ظ…طھظٹط§ط² ط¬ط¯ظٹط¯')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: 'ًں‘¤ط§ظ„ط¹ط¶ظˆ ', value: `<@${privilegeUserId}>`, inline: false },
                        { name: 'ًں“… طھط§ط±ظٹط® ط§ظ„ط¥ظ…طھظٹط§ط²', value: privilegeDate, inline: false },
                        { name: 'ًں“‌ ط§ظ„ط³ط¨ط¨', value: privilegeReason, inline: false },
                        { name: 'ًں‘¤ ط§ظ„ظ…ط³ط¤ظˆظ„', value: `<@${userId}>`, inline: false },
                        { name: 'ًں•’ ظˆظ‚طھ ط§ظ„ظ…ظ†ط­', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'ظ†طھظ…ظ†ظٹ ظ„ظƒ ط§ظ„طھظˆظپظٹظ‚ ظˆ ط§ظ„ظ†ط¬ط§ط­ - ط§ظ„ط¥ط¯ط§ط±ط©', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
                await logAction('ظ…ظ†ط­ ط¥ظ…طھظٹط§ط²', interaction.user, {
                    'ط§ظ„طھط§ط±ظٹط®': privilegeDate,
                    'ط§ظ„ط³ط¨ط¨': privilegeReason.substring(0, 200),
                    'ط§ظ„ط±طھط¨ط© ط§ظ„ظ…ظ…ظ†ظˆط­ط©': PRIVILEGE_ROLE_ID
                }, privilegeTargetMember.user);
                
                await interaction.reply({ 
                    content: `âœ… **طھظ… ظ…ظ†ط­ ط§ظ„ط¥ظ…طھظٹط§ط² ط¨ظ†ط¬ط§ط­!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ظ…ط¹ط§ظ„ط¬ط© ط§ظ„ظ…ظˆط¯ط§ظ„:', error);
        await interaction.reply({ 
            content: 'â‌Œ **ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ظ…ط¹ط§ظ„ط¬ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ!**', 
            ephemeral: true 
        });
    }
});

// ط£ظˆط§ظ…ط± ط§ظ„ط¯ط±ط¯ط´ط© ط§ظ„طھظ‚ظ„ظٹط¯ظٹط©
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // ط§ظ„ط£ظ†طھظٹ ط³ط¨ط§ظ… ظ„ظ„ط£ظˆط§ظ…ط±
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('âڑ ï¸ڈ **ط§ظ„ط±ط¬ط§ط، ط§ظ„ط§ظ†طھط¸ط§ط± 3 ط«ظˆط§ظ†ظٹ ط¨ظٹظ† ظƒظ„ ط£ظ…ط±!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    


// ط§ظ„ط±طھط¨ط© ط§ظ„ظ…ط´طھط±ظƒط© ظ„ظƒظ„ ط§ظ„ط£ظˆط§ظ…ط±
const COMMAND_ROLE_ID = '1455328577783468185'; // ط§ظ„ط±طھط¨ط© ط§ظ„ظ„ظٹ طھظ‚ط¯ط± طھط³طھط®ط¯ظ… !say ظˆ !clear
const COMMAND_LOG_CHANNEL_ID = '1456111431630979113'; // ظ‚ظ†ط§ط© ط§ظ„ظ„ظˆط¬

// ط§ظ„ط£ظ…ط± !clear
if (message.content.startsWith('!clear')) {
    // ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طµظ„ط§ط­ظٹط©
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط© ظ„ط§ط³طھط®ط¯ط§ظ… ظ‡ط°ط§ ط§ظ„ط£ظ…ط±!**');
    }

    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
        return message.reply('âڑ ï¸ڈ **ط§ط³طھط®ط¯ظ…: `!clear <ط¹ط¯ط¯>`**');
    }

    if (amount < 1 || amount > 100) {
        return message.reply('âڑ ï¸ڈ **ظٹظ…ظƒظ† ظ…ط³ط­ ظ…ظ† 1 ط¥ظ„ظ‰ 100 ط±ط³ط§ظ„ط© ظپظ‚ط·!**');
    }

    try {
        await message.channel.bulkDelete(amount + 1, true);

        const reply = await message.channel.send(`âœ… **طھظ… ظ…ط³ط­ ${amount} ط±ط³ط§ظ„ط©!**`);
        setTimeout(() => reply.delete(), 3000);

        // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('ًں§¹ ط£ظ…ط± !clear')
                .addFields(
                    { name: 'ط§ظ„ظ…ط³طھط®ط¯ظ…', value: `<@${message.author.id}>`, inline: true },
                    { name: 'ط§ظ„ظ‚ظ†ط§ط©', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'ط¹ط¯ط¯ ط§ظ„ط±ط³ط§ط¦ظ„', value: `${amount}`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ظ…ط³ط­ ط§ظ„ط±ط³ط§ط¦ظ„:', error);
        message.reply('â‌Œ **ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھظ†ظپظٹط° ط§ظ„ط£ظ…ط±!**');
    }
}

// ط§ظ„ط£ظ…ط± !say
if (message.content.startsWith('!say')) {
    // ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طµظ„ط§ط­ظٹط©
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط© ظ„ط§ط³طھط®ط¯ط§ظ… ظ‡ط°ط§ ط§ظ„ط£ظ…ط±!**');
    }

    const content = message.content.slice(5).trim();
    if (!content) {
        return message.reply('âڑ ï¸ڈ **ط§ط³طھط®ط¯ظ…: `!say <ط§ظ„ط±ط³ط§ظ„ط©>`**');
    }

    try {
        await message.delete();
        await message.channel.send({ content: content });

        // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('ًں“¢ ط£ظ…ط± !say')
                .addFields(
                    { name: 'ط§ظ„ظ…ط³طھط®ط¯ظ…', value: `<@${message.author.id}>`, inline: true },
                    { name: 'ط§ظ„ظ‚ظ†ط§ط©', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'ط§ظ„ط±ط³ط§ظ„ط©', value: `${content.substring(0, 1000)}`, inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©:', error);
        message.reply('â‌Œ **ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھظ†ظپظٹط° ط§ظ„ط£ظ…ط±!**');
    }
}

    

    // ط§ظ„ط£ظ…ط± !refresh
    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**');
        }
        
        try {
            const reply = await message.reply('ًں”„ **ط¬ط§ط±ظٹ ط§ظ„طھط­ط¯ظٹط«...**');
            
            // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
            await logAction('طھط­ط¯ظٹط« ط§ظ„ظ„ظˆط­ط© ط¹ط¨ط± ط§ظ„ط£ظ…ط±', message.author);
            
            await createControlPanel();
            await reply.edit('âœ… **طھظ… ط§ظ„طھط­ط¯ظٹط«!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('â‌Œ ط®ط·ط£ ظپظٹ طھط­ط¯ظٹط« ط§ظ„ظ„ظˆط­ط©:', error);
            message.reply('â‌Œ **ط­ط¯ط« ط®ط·ط£!**');
        }
    }
    
    // ط§ظ„ط£ظ…ط± !status
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط©!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('âœ… **طھظ… طھط­ط¯ظٹط« ط­ط§ظ„ط© ط§ظ„ط¨ظˆطھ!**');
        } catch (error) {
            console.error('â‌Œ ط®ط·ط£ ظپظٹ طھط­ط¯ظٹط« ط§ظ„ط­ط§ظ„ط©:', error);
            message.reply('â‌Œ **ط­ط¯ط« ط®ط·ط£!**');
        }
    }


// ===== ط£ظ…ط± !tag طھط؛ظٹظٹط± ط§ظ„ط§ط³ظ… =====
if (message.content.startsWith('!tag')) {
    // ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طµظ„ط§ط­ظٹط©
    if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
        return message.reply('â›” **ظ„ظٹط³ ظ„ط¯ظٹظƒ طµظ„ط§ط­ظٹط© ظ„ط§ط³طھط®ط¯ط§ظ… ظ‡ط°ط§ ط§ظ„ط£ظ…ط±!**');
    }

    const member = message.mentions.members.first();
    const newName = message.content.split(' ').slice(2).join(' ');

    if (!member || !newName) {
        return message.reply('âڑ ï¸ڈ **ط§ط³طھط®ط¯ظ…:** `!tag @user ط§ظ„ط§ط³ظ…_ط§ظ„ط¬ط¯ظٹط¯`');
    }

    try {
        const oldName = member.nickname || member.user.username;

        await member.setNickname(newName);

        // ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط© ط§ظ„ط±ط¯ ظˆط­ظپط¸ظ‡ط§ ظپظٹ ظ…طھط؛ظٹط±
        const sentMsg = await message.reply(
            `âœ… **طھظ… طھط؛ظٹظٹط± ط§ظ„ط§ط³ظ… ط¨ظ†ط¬ط§ط­**\n` +
            `ًں‘¤ ${member.user.tag}\n` +
            `âœڈï¸ڈ ${oldName} â‍œ ${newName}`
        );

        // ظ…ط³ط­ ط§ظ„ط±ط³ط§ظ„ط© ط¨ط¹ط¯ 3 ط«ظˆط§ظ†ظٹ (3000 ظ…ظ„ظٹ ط«ط§ظ†ظٹط©)
        setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

        // طھط³ط¬ظٹظ„ ط§ظ„ظ„ظˆط¬
        const logChannel = await message.client.channels.fetch(
            process.env.TAG_LOG_CHANNEL_ID
        );

        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('ًںڈ·ï¸ڈ ط£ظ…ط± !tag')
                .setColor(0x3498DB)
                .addFields(
                    { name: 'ًں‘® ط¨ظˆط§ط³ط·ط©', value: `<@${message.author.id}>`, inline: false },
                    { name: 'ًں‘¤ ط§ظ„ط¹ط¶ظˆ', value: `<@${member.id}>`, inline: false },
                    { name: 'âœڈï¸ڈ ط§ظ„ط§ط³ظ… ط§ظ„ظ‚ط¯ظٹظ…', value: oldName, inline: false },
                    { name: 'ًں†• ط§ظ„ط§ط³ظ… ط§ظ„ط¬ط¯ظٹط¯', value: newName, inline: false },
                    { name: 'ًں“چ ط§ظ„ظ‚ظ†ط§ط©', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('â‌Œ ط®ط·ط£ ظپظٹ ط£ظ…ط± !tag:', error);
        const errorMsg = await message.reply('â‌Œ **ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھط؛ظٹظٹط± ط§ظ„ط§ط³ظ…!**');
        // ظ…ط³ط­ ط±ط³ط§ظ„ط© ط§ظ„ط®ط·ط£ ط¨ط¹ط¯ 3 ط«ظˆط§ظ†ظٹ ظƒظ…ط§ظ†
        setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
    }
}
});




// طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
client.login(process.env.DISCORD_TOKEN);​require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

// تعريف جميع القنوات والرتب من ملف .env
const {
    // القنوات الأساسية
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    
    // قنوات التقارير (منفصلة)
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    
    // الرتب
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

// متغيرات لتخزين معرفات الرسائل
let controlPanelMessageId = null;
let botStatusMessageId = null;

// أنتي سبام للتفاعلات
const spamProtection = new Collection();
const SPAM_TIME = 3000; // 3 ثواني بين كل استخدام

// حدث عند جاهزية البوت
client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    console.log(`👥 موجود في ${client.guilds.cache.size} سيرفر`);
    

        // تعيين نشاط البوت المتغير
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج',
        'مشغول الان',
        'اتمني لا توجهون مشاكل'
    ];
    
    // تغيير النشاط كل 30 ثانية
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        
        // الانتقال للنشاط التالي
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000); // 30 ثانية
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    

    
    // إنشاء لوحة التحكم
    await createControlPanel();
    
    // إنشاء إمبد حالة البوت
    await createBotStatusEmbed();
    
    // تحديث حالة البوت كل 3 دقائق
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000); // 3 دقائق = 180000 مللي ثانية
});

// دالة لإنشاء لوحة التحكم
async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إنشاء إمبد للوحة التحكم مع صورة
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true') // صورة لوحة التحكم
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true') // صورة بانر للوحة التحكم
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        // إنشاء أزرار اللوحة
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        // إرسال اللوحة وحفظ معرف الرسالة
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

// دالة لإنشاء إمبد حالة البوت
async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إرسال الإمبد الأولي وحفظ المعرف
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

// دالة لتحديث إمبد حالة البوت
async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حساب إحصائيات البوت
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        // تنسيق الوقت
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        // إنشاء إمبد حالة البوت مع صورة
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
         .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false  },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false  },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false  },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false  },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true') // صورة بانر للحالة
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        // تحديث الرسالة أو إنشاء جديدة
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

// دالة للتحقق من الأنتي سبام
function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) {
            return true; // سبام
        }
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false; // ليس سبام
}

// دالة لتسجيل اللوج
async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        // إضافة تفاصيل إضافية
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

// حدث عند التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    // التحقق من الأنتي سبام
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
  const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                // تسجيل اللوج
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
case 'add_note':
    // جلب العضو الكامل للتأكد من الرتب
    const fullMember = await interaction.guild.members.fetch(interaction.user.id);

    if (!fullMember.roles.cache.has(process.env.ADD_NOTE_BUTTON_ROLE_ID)) {
        return interaction.reply({ 
            content: '⛔ **ليس لديك صلاحية!**', 
            ephemeral: true 
        });
    }

                
                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(REFRESH_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

// حدث عند إرسال المودال
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');

 // محاولة الحصول على العضو
 const targetMember = member;
                
                // إرسال التقرير في قناة تقارير الإعضاء المنفصلة
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
    {
        name: '👤 مسؤول التقرير',
        value: `<@${interaction.user.id}>`,
        inline: false
    },
    {
        name: '🕒 وقت التقرير',
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true
    },
    {
        name: '📝 البيانات',
        value: reportMessage.substring(0, 1024),
        inline: false
    }
)

                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
// تسجيل اللوج
await logAction('إرسال تقرير عضو', interaction.user, {
    'محتوى التقرير': reportMessage.substring(0, 200),
    'العضو المستهدف': `<@${interaction.user.id}>`
}, interaction.user);

                
                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                // إرسال التقرير في قناة تقارير اللجنة المنفصلة
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                // تسجيل اللوج
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
 

 // إرسال الملاحظة
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📝 ملاحظة جديدة على عضو')
                    .setDescription('**تم إضافة ملاحظة جديدة**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
                        { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
                        { name: '📝 السبب', value: noteReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
                        { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                // تسجيل اللوج
                await logAction('إضافة ملاحظة', interaction.user, {
                    'التاريخ': noteDate,
                    'السبب': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
                    ephemeral: true 
                });
                break;

                // =========إرسال الإمتياز
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⭐ إمتياز جديد')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: '👤العضو ', value: `<@${privilegeUserId}>`, inline: false },
                        { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
                        { name: '📝 السبب', value: privilegeReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
                        { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                // تسجيل اللوج
                await logAction('منح إمتياز', interaction.user, {
                    'التاريخ': privilegeDate,
                    'السبب': privilegeReason.substring(0, 200),
                    'الرتبة الممنوحة': PRIVILEGE_ROLE_ID
                }, privilegeTargetMember.user);
                
                await interaction.reply({ 
                    content: `✅ **تم منح الإمتياز بنجاح!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة المودال:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة البيانات!**', 
            ephemeral: true 
        });
    }
});

// أوامر الدردشة التقليدية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // الأنتي سبام للأوامر
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    


// الرتبة المشتركة لكل الأوامر
const COMMAND_ROLE_ID = '1455328577783468185'; // الرتبة اللي تقدر تستخدم !say و !clear
const COMMAND_LOG_CHANNEL_ID = '1456111431630979113'; // قناة اللوج

// الأمر !clear
if (message.content.startsWith('!clear')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
        return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
    }

    if (amount < 1 || amount > 100) {
        return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
    }

    try {
        await message.channel.bulkDelete(amount + 1, true);

        const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
        setTimeout(() => reply.delete(), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🧹 أمر !clear')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في مسح الرسائل:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

// الأمر !say
if (message.content.startsWith('!say')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const content = message.content.slice(5).trim();
    if (!content) {
        return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
    }

    try {
        await message.delete();
        await message.channel.send({ content: content });

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('📢 أمر !say')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('❌ خطأ في إرسال الرسالة:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

    

    // الأمر !refresh
    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            
            // تسجيل اللوج
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    // الأمر !status
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }


// ===== أمر !tag تغيير الاسم =====
if (message.content.startsWith('!tag')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const member = message.mentions.members.first();
    const newName = message.content.split(' ').slice(2).join(' ');

    if (!member || !newName) {
        return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
    }

    try {
        const oldName = member.nickname || member.user.username;

        await member.setNickname(newName);

        // إرسال رسالة الرد وحفظها في متغير
        const sentMsg = await message.reply(
            `✅ **تم تغيير الاسم بنجاح**\n` +
            `👤 ${member.user.tag}\n` +
            `✏️ ${oldName} ➜ ${newName}`
        );

        // مسح الرسالة بعد 3 ثواني (3000 ملي ثانية)
        setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(
            process.env.TAG_LOG_CHANNEL_ID
        );

        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🏷️ أمر !tag')
                .setColor(0x3498DB)
                .addFields(
                    { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                    { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                    { name: '✏️ الاسم القديم', value: oldName, inline: false },
                    { name: '🆕 الاسم الجديد', value: newName, inline: false },
                    { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في أمر !tag:', error);
        const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
        // مسح رسالة الخطأ بعد 3 ثواني كمان
        setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
    }
}
});




// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);​require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

// تعريف جميع القنوات والرتب من ملف .env
const {
    // القنوات الأساسية
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    
    // قنوات التقارير (منفصلة)
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    
    // الرتب
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

// متغيرات لتخزين معرفات الرسائل
let controlPanelMessageId = null;
let botStatusMessageId = null;

// أنتي سبام للتفاعلات
const spamProtection = new Collection();
const SPAM_TIME = 3000; // 3 ثواني بين كل استخدام

// حدث عند جاهزية البوت
client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    console.log(`👥 موجود في ${client.guilds.cache.size} سيرفر`);
    

        // تعيين نشاط البوت المتغير
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج',
        'مشغول الان',
        'اتمني لا توجهون مشاكل'
    ];
    
    // تغيير النشاط كل 30 ثانية
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        
        // الانتقال للنشاط التالي
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000); // 30 ثانية
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    

    
    // إنشاء لوحة التحكم
    await createControlPanel();
    
    // إنشاء إمبد حالة البوت
    await createBotStatusEmbed();
    
    // تحديث حالة البوت كل 3 دقائق
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000); // 3 دقائق = 180000 مللي ثانية
});

// دالة لإنشاء لوحة التحكم
async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إنشاء إمبد للوحة التحكم مع صورة
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true') // صورة لوحة التحكم
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true') // صورة بانر للوحة التحكم
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        // إنشاء أزرار اللوحة
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        // إرسال اللوحة وحفظ معرف الرسالة
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

// دالة لإنشاء إمبد حالة البوت
async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إرسال الإمبد الأولي وحفظ المعرف
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

// دالة لتحديث إمبد حالة البوت
async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حساب إحصائيات البوت
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        // تنسيق الوقت
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        // إنشاء إمبد حالة البوت مع صورة
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
         .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false  },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false  },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false  },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false  },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true') // صورة بانر للحالة
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        // تحديث الرسالة أو إنشاء جديدة
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

// دالة للتحقق من الأنتي سبام
function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) {
            return true; // سبام
        }
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false; // ليس سبام
}

// دالة لتسجيل اللوج
async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        // إضافة تفاصيل إضافية
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

// حدث عند التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    // التحقق من الأنتي سبام
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
  const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                // تسجيل اللوج
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
case 'add_note':
    // جلب العضو الكامل للتأكد من الرتب
    const fullMember = await interaction.guild.members.fetch(interaction.user.id);

    if (!fullMember.roles.cache.has(process.env.ADD_NOTE_BUTTON_ROLE_ID)) {
        return interaction.reply({ 
            content: '⛔ **ليس لديك صلاحية!**', 
            ephemeral: true 
        });
    }

                
                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(REFRESH_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

// حدث عند إرسال المودال
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');

 // محاولة الحصول على العضو
 const targetMember = member;
                
                // إرسال التقرير في قناة تقارير الإعضاء المنفصلة
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
    {
        name: '👤 مسؤول التقرير',
        value: `<@${interaction.user.id}>`,
        inline: false
    },
    {
        name: '🕒 وقت التقرير',
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true
    },
    {
        name: '📝 البيانات',
        value: reportMessage.substring(0, 1024),
        inline: false
    }
)

                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
// تسجيل اللوج
await logAction('إرسال تقرير عضو', interaction.user, {
    'محتوى التقرير': reportMessage.substring(0, 200),
    'العضو المستهدف': `<@${interaction.user.id}>`
}, interaction.user);

                
                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                // إرسال التقرير في قناة تقارير اللجنة المنفصلة
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                // تسجيل اللوج
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
 case 'add_note_modal':
    const noteDate = interaction.fields.getTextInputValue('note_date');
    const noteUserId = interaction.fields.getTextInputValue('note_user_id');
    const noteReason = interaction.fields.getTextInputValue('note_reason');
    
    let noteTargetMember;
    try {
        noteTargetMember = await interaction.guild.members.fetch(noteUserId);
    } catch {
        noteTargetMember = null;
    }
    
    // إرسال الملاحظة
    const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
    
    const noteEmbed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('📝 ملاحظة جديدة على عضو')
        .setDescription('**تم إضافة ملاحظة جديدة**')
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
        .addFields(
            { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
            { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
            { name: '📝 السبب', value: noteReason, inline: false },
            { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
            { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
    
    await notesChannel.send({ embeds: [noteEmbed] });
    
    // تسجيل اللوج
    await logAction('إضافة ملاحظة', interaction.user, {
        'التاريخ': noteDate,
        'السبب': noteReason.substring(0, 200)
    }, noteTargetMember?.user || null);
    
    await interaction.reply({ 
        content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
        ephemeral: true 
    });
    break;

case 'grant_privilege_modal':
    const privilegeDate = interaction.fields.getTextInputValue('privilege_date');
    const privilegeUserId = interaction.fields.getTextInputValue('privilege_user_id');
    const privilegeReason = interaction.fields.getTextInputValue('privilege_reason');
    
    let privilegeTargetMember;
    try {
        privilegeTargetMember = await interaction.guild.members.fetch(privilegeUserId);
    } catch {
        privilegeTargetMember = null;
    }
    
    // إرسال الإمتياز
    const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
    
    const privilegeEmbed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle('⭐ إمتياز جديد')
        .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
        .addFields(
            { name: '👤 العضو', value: privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`, inline: false },
            { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
            { name: '📝 السبب', value: privilegeReason, inline: false },
            { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
            { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
    
    await privilegeChannel.send({ embeds: [privilegeEmbed] });
    
    // تسجيل اللوج
    await logAction('منح إمتياز', interaction.user, {
        'التاريخ': privilegeDate,
        'السبب': privilegeReason.substring(0, 200),
        'العضو المستهدف': privilegeTargetMember ? `<@${privilegeUserId}>` : `آيدي: ${privilegeUserId}`
    }, privilegeTargetMember?.user || null);
    
    await interaction.reply({ 
        content: `✅ **تم منح الإمتياز بنجاح!**`, 
        ephemeral: true 
    });
    break;

// أوامر الدردشة التقليدية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // الأنتي سبام للأوامر
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    


// الرتبة المشتركة لكل الأوامر
const COMMAND_ROLE_ID = '1455328577783468185'; // الرتبة اللي تقدر تستخدم !say و !clear
const COMMAND_LOG_CHANNEL_ID = '1456111431630979113'; // قناة اللوج

// الأمر !clear
if (message.content.startsWith('!clear')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
        return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
    }

    if (amount < 1 || amount > 100) {
        return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
    }

    try {
        await message.channel.bulkDelete(amount + 1, true);

        const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
        setTimeout(() => reply.delete(), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🧹 أمر !clear')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في مسح الرسائل:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

// الأمر !say
if (message.content.startsWith('!say')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const content = message.content.slice(5).trim();
    if (!content) {
        return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
    }

    try {
        await message.delete();
        await message.channel.send({ content: content });

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('📢 أمر !say')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('❌ خطأ في إرسال الرسالة:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

    

    // الأمر !refresh
    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            
            // تسجيل اللوج
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    // الأمر !status
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }


// ===== أمر !tag تغيير الاسم =====
if (message.content.startsWith('!tag')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const member = message.mentions.members.first();
    const newName = message.content.split(' ').slice(2).join(' ');

    if (!member || !newName) {
        return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
    }

    try {
        const oldName = member.nickname || member.user.username;

        await member.setNickname(newName);

        // إرسال رسالة الرد وحفظها في متغير
        const sentMsg = await message.reply(
            `✅ **تم تغيير الاسم بنجاح**\n` +
            `👤 ${member.user.tag}\n` +
            `✏️ ${oldName} ➜ ${newName}`
        );

        // مسح الرسالة بعد 3 ثواني (3000 ملي ثانية)
        setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(
            process.env.TAG_LOG_CHANNEL_ID
        );

        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🏷️ أمر !tag')
                .setColor(0x3498DB)
                .addFields(
                    { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                    { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                    { name: '✏️ الاسم القديم', value: oldName, inline: false },
                    { name: '🆕 الاسم الجديد', value: newName, inline: false },
                    { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في أمر !tag:', error);
        const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
        // مسح رسالة الخطأ بعد 3 ثواني كمان
        setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
    }
}
});




// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);​require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ]
});

// تعريف جميع القنوات والرتب من ملف .env
const {
    // القنوات الأساسية
    CONTROL_PANEL_CHANNEL_ID,
    BOT_STATUS_CHANNEL_ID,
    
    // قنوات التقارير (منفصلة)
    MEMBER_REPORT_CHANNEL_ID,
    COMMITTEE_REPORT_CHANNEL_ID,
    NOTES_CHANNEL_ID,
    PRIVILEGE_CHANNEL_ID,
    LOG_CHANNEL_ID,
    
    // الرتب
    ADMIN_ROLE_ID,
    COMMITTEE_ROLE_ID,
    PRIVILEGE_ROLE_ID,
    ADD_NOTE_BUTTON_ROLE_ID,
    GRANT_PRIVILEGE_BUTTON_ROLE_ID
} = process.env;

// متغيرات لتخزين معرفات الرسائل
let controlPanelMessageId = null;
let botStatusMessageId = null;

// أنتي سبام للتفاعلات
const spamProtection = new Collection();
const SPAM_TIME = 3000; // 3 ثواني بين كل استخدام

// حدث عند جاهزية البوت
client.once('ready', async () => {
    console.log(`✅ البوت ${client.user.tag} يعمل الآن!`);
    console.log(`👥 موجود في ${client.guilds.cache.size} سيرفر`);
    

        // تعيين نشاط البوت المتغير
    const activities = [
        'كراج الميكانيكي',
        'انا في خدمتكم', 
        'يعمل مدير الكراج',
        'مشغول الان',
        'اتمني لا توجهون مشاكل'
    ];
    
    // تغيير النشاط كل 30 ثانية
    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex], { 
            type: ActivityType.Watching 
        });
        
        // الانتقال للنشاط التالي
        activityIndex = (activityIndex + 1) % activities.length;
    }, 30000); // 30 ثانية
    
    console.log('✅ تم تفعيل الأنشطة المتغيرة للبوت');
    

    
    // إنشاء لوحة التحكم
    await createControlPanel();
    
    // إنشاء إمبد حالة البوت
    await createBotStatusEmbed();
    
    // تحديث حالة البوت كل 3 دقائق
    setInterval(async () => {
        try {
            await updateBotStatusEmbed();
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة البوت:', error);
        }
    }, 180000); // 3 دقائق = 180000 مللي ثانية
});

// دالة لإنشاء لوحة التحكم
async function createControlPanel() {
    try {
        const channel = await client.channels.fetch(CONTROL_PANEL_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 20 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إنشاء إمبد للوحة التحكم مع صورة
        const controlPanelEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛑 لوحة التحكم 🛑')
            .setDescription('**يمكنك إختيار الزر المناسب للقيام بـ مهامك المطلوبة :**')
            .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456114628458446889/MTMyLnBuZw.png?ex=69572fec&is=6955de6c&hm=627ed99d848db5a682e766815cc6a9e0c105ba74a242b656f552f095b422f72d&animated=true') // صورة لوحة التحكم
            .addFields(
                { name: '📋إرسال تقرير مسؤول الإعضاء', value: 'إرسال التقرير اليومى لـ مسؤول الإعضاء ', inline: false },
                { name: '👥 إرسال تقرير مسؤول اللجنة', value: 'إرسال التقرير اليومى لـ مسؤول اللجنة', inline: false },
                { name: '📝 الملاحظات', value: 'تسجيل الملاحظات ', inline: false },
                { name: '⭐ الإمتيازات', value: 'تسجيل الإمتيازات', inline: false }
            )
            .setImage('https://cdn.discordapp.com/attachments/1453861820917088298/1456108401812701236/6b4cb0ddbeea9f24.png?ex=69572a20&is=6955d8a0&hm=95428a0929019dd6f51e0d42e959dc66356c09c26bc98b33b7320bf65b7aee82&animated=true') // صورة بانر للوحة التحكم
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://media.discordapp.net/attachments/1453861820917088298/1456104512396984486/image.png?ex=69572680&is=6955d500&hm=43e512e5f93cd09d250ac0b95e53f61e16807ac9ff2e32b6e68f61dfbbe7ae6e&animated=true' 
            })
            .setTimestamp();
        
        // إنشاء أزرار اللوحة
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('member_report')
                    .setLabel(' إرسال تقرير مسؤول الإعضاء')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('committee_report')
                    .setLabel(' إرسال تقرير مسؤول اللجنة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('add_note')
                    .setLabel('الملاحظات')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('grant_privilege')
                    .setLabel('الإمتيازات')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('refresh_panel')
                    .setLabel(' تحديث لوحة التحكم')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
        
        // إرسال اللوحة وحفظ معرف الرسالة
        const message = await channel.send({ 
            embeds: [controlPanelEmbed], 
            components: [row, row2] 
        });
        
        controlPanelMessageId = message.id;
        console.log('✅ تم إنشاء لوحة التحكم بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء لوحة التحكم:', error);
    }
}

// دالة لإنشاء إمبد حالة البوت
async function createBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حذف الرسائل القديمة في القناة
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        // إرسال الإمبد الأولي وحفظ المعرف
        const message = await updateBotStatusEmbed();
        botStatusMessageId = message.id;
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء إمبد حالة البوت:', error);
    }
}

// دالة لتحديث إمبد حالة البوت
async function updateBotStatusEmbed() {
    try {
        const channel = await client.channels.fetch(BOT_STATUS_CHANNEL_ID);
        
        // حساب إحصائيات البوت
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const ping = client.ws.ping;
        
        // تنسيق الوقت
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
        
        // إنشاء إمبد حالة البوت مع صورة
        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(' حالة النظام 🤖')
            .setDescription('**معلومات وإحصائيات النظام **')
         .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456385399793651773/project.png?ex=69582c19&is=6956da99&hm=e86505010f417821d9547b4a5fd821bdda7a307f94c48ab4fb7f9aa383a36d09&animated=true')
            .addFields(
                { name: '📊 الإحصائيات', value: `السيرفرات: **${guilds}**\nالأعضاء: **${users}**`, inline: false  },
                { name: '⚡ الأداء', value: `**${ping}ms**\nوقت التشغيل: **${uptimeString}**`, inline: false  },
                { name: '📅 آخر تحديث', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false  },
                { name: '🟢 : الحالة', value: '**✅ النظام يعمل بشكل طبيعي**', inline: true },
                { name: '💾 الذاكرة', value: `**${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB**`, inline: false  },
            )
            .setImage('https://media.discordapp.net/attachments/1455328057383715030/1456114660418912468/image.png?ex=69572ff4&is=6955de74&hm=75ecc8fe9158d9e2d81701f5010482300e4aee9b8f4773dd391eb18cbb642994&animated=true') // صورة بانر للحالة
            .setFooter({ 
                text: 'Dev : Yousef Ayman', 
                iconURL: 'https://cdn.discordapp.com/attachments/1455328057383715030/1455703714672148676/d8127a0b4e3ed616b07158daf24d046c.png?ex=6955b13b&is=69545fbb&hm=3c7a42c133a213f19058b42371ec68c3966a75351811ef7dbd8e050230bb4739&animated=true' 
            })
            .setTimestamp();
        
        // تحديث الرسالة أو إنشاء جديدة
        let message;
        if (botStatusMessageId) {
            try {
                message = await channel.messages.fetch(botStatusMessageId);
                await message.edit({ embeds: [statusEmbed] });
            } catch {
                message = await channel.send({ embeds: [statusEmbed] });
                botStatusMessageId = message.id;
            }
        } else {
            message = await channel.send({ embeds: [statusEmbed] });
            botStatusMessageId = message.id;
        }
        
        return message;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث إمبد حالة البوت:', error);
    }
}

// دالة للتحقق من الأنتي سبام
function checkSpam(userId, interactionId) {
    const key = `${userId}_${interactionId}`;
    const now = Date.now();
    
    if (spamProtection.has(key)) {
        const lastUse = spamProtection.get(key);
        if (now - lastUse < SPAM_TIME) {
            return true; // سبام
        }
    }
    
    spamProtection.set(key, now);
    setTimeout(() => spamProtection.delete(key), SPAM_TIME);
    return false; // ليس سبام
}

// دالة لتسجيل اللوج
async function logAction(actionType, user, details = {}, targetUser = null) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        
        const logEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('📝 سجل النظام')
            .setDescription(`**${actionType}**`)
            .addFields(
                { name: '👤 المستخدم', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 المعرف', value: user.id, inline: true }
            )
            .setTimestamp();
        
        // إضافة تفاصيل إضافية
        if (targetUser) {
            logEmbed.addFields({ 
                name: '🎯 العضو المستهدف', 
                value: `<@${targetUser.id}> (${targetUser.tag})`, 
                inline: true 
            });
        }
        
        Object.entries(details).forEach(([key, value]) => {
            if (value) {
                logEmbed.addFields({ name: key, value: String(value).substring(0, 1024), inline: true });
            }
        });
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل اللوج:', error);
    }
}

// حدث عند التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const member = interaction.guild.members.cache.get(userId);
    
    // التحقق من الأنتي سبام
    if (checkSpam(userId, interaction.customId)) {
        return interaction.reply({ 
            content: '⚠️ **الرجاء الانتظار 3 ثواني بين كل استخدام!**', 
            ephemeral: true 
        });
    }
    
    try {
        switch (interaction.customId) {
            case 'member_report':
  const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                // تسجيل اللوج
                await logAction('ضغط على زر تقرير العضو', interaction.user);
                
                const memberReportModal = new ModalBuilder()
                    .setCustomId('member_report_modal')
                    .setTitle('📋 تقرير مسؤول الإعضاء');
                
                const reportMessageInput = new TextInputBuilder()
                    .setCustomId('report_message')
                    .setLabel('رسالة التقرير')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب محتوى التقرير هنا...')
                    .setRequired(true)
                    .setMaxLength(5000);
                
                
                memberReportModal.addComponents(
                    new ActionRowBuilder().addComponents(reportMessageInput)
                );
                
                await interaction.showModal(memberReportModal);
                break;
                
            case 'committee_report':
                if (!member.roles.cache.has(COMMITTEE_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تقرير اللجنة', interaction.user);
                
                const committeeReportModal = new ModalBuilder()
                    .setCustomId('committee_report_modal')
                    .setTitle('👥 تقرير مسؤول اللجنة');
                
                const committeeReportInput = new TextInputBuilder()
                    .setCustomId('committee_report_content')
                    .setLabel('محتوى تقرير اللجنة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('اكتب تقرير اللجنة هنا...')
                    .setRequired(true)
                    .setMaxLength(1000);
                
                committeeReportModal.addComponents(
                    new ActionRowBuilder().addComponents(committeeReportInput)
                );
                
                await interaction.showModal(committeeReportModal);
                break;
                
case 'add_note':
    // جلب العضو الكامل للتأكد من الرتب
    const fullMember = await interaction.guild.members.fetch(interaction.user.id);

    if (!fullMember.roles.cache.has(process.env.ADD_NOTE_BUTTON_ROLE_ID)) {
        return interaction.reply({ 
            content: '⛔ **ليس لديك صلاحية!**', 
            ephemeral: true 
        });
    }

                
                await logAction('ضغط على زر إضافة ملاحظة', interaction.user);
                
                const noteModal = new ModalBuilder()
                    .setCustomId('add_note_modal')
                    .setTitle('📝 إضافة ملاحظة على عضو');
                
                noteModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_date')
                            .setLabel('تاريخ الملاحظة')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('note_reason')
                            .setLabel('سبب الملاحظة')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب الملاحظة هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(noteModal);
                break;
                
            case 'grant_privilege':
                if (!member.roles.cache.has(GRANT_PRIVILEGE_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر منح إمتياز', interaction.user);
                
                const privilegeModal = new ModalBuilder()
                    .setCustomId('grant_privilege_modal')
                    .setTitle('⭐ منح إمتياز لعضو');
                
                privilegeModal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_date')
                            .setLabel('تاريخ الإمتياز')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('مثال: 2023-12-31')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_user_id')
                            .setLabel('آيدي الشخص (ID)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('123456789012345678')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('privilege_reason')
                            .setLabel('سبب منح الإمتياز')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('اكتب سبب منح الإمتياز هنا...')
                            .setRequired(true)
                            .setMaxLength(500)
                    )
                );
                
                await interaction.showModal(privilegeModal);
                break;
                
            case 'refresh_panel':
                if (!member.roles.cache.has(REFRESH_BUTTON_ROLE_ID)) {
                    return interaction.reply({ 
                        content: '⛔ **ليس لديك صلاحية!**', 
                        ephemeral: true 
                    });
                }
                
                await logAction('ضغط على زر تحديث اللوحة', interaction.user);
                
                await interaction.reply({ 
                    content: '🔄 **جاري تحديث لوحة التحكم...**', 
                    ephemeral: true 
                });
                await createControlPanel();
                await interaction.editReply({ 
                    content: '✅ **تم تحديث لوحة التحكم بنجاح!**' 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة التفاعل:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة طلبك!**', 
            ephemeral: true 
        });
    }
});

// حدث عند إرسال المودال
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    const userId = interaction.user.id;
    const member = interaction.member;
    
    try {
        switch (interaction.customId) {
            case 'member_report_modal':
                const reportMessage = interaction.fields.getTextInputValue('report_message');

 // محاولة الحصول على العضو
 const targetMember = member;
                
                // إرسال التقرير في قناة تقارير الإعضاء المنفصلة
                const memberReportChannel = await client.channels.fetch(MEMBER_REPORT_CHANNEL_ID);
                
                const reportEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📋 التقرير اليومي لـ مسؤول الإعضاء')
                    .setDescription('▬▬▬▬ ﷽ ▬▬▬▬')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                   .addFields(
    {
        name: '👤 مسؤول التقرير',
        value: `<@${interaction.user.id}>`,
        inline: false
    },
    {
        name: '🕒 وقت التقرير',
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true
    },
    {
        name: '📝 البيانات',
        value: reportMessage.substring(0, 1024),
        inline: false
    }
)

                    .setFooter({ text: 'نظام التقارير - الإدارة ', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await memberReportChannel.send({ embeds: [reportEmbed] });
                
// تسجيل اللوج
await logAction('إرسال تقرير عضو', interaction.user, {
    'محتوى التقرير': reportMessage.substring(0, 200),
    'العضو المستهدف': `<@${interaction.user.id}>`
}, interaction.user);

                
                await interaction.reply({ 
                    content: '✅ **تم إرسال التقرير بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'committee_report_modal':
                const committeeReport = interaction.fields.getTextInputValue('committee_report_content');
                
                // إرسال التقرير في قناة تقارير اللجنة المنفصلة
                const committeeReportChannel = await client.channels.fetch(COMMITTEE_REPORT_CHANNEL_ID);
                
                const committeeEmbed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('👥 تقرير مسؤول اللجنة')
                    .setDescription(committeeReport)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456458568831209687/report.png?ex=6958703e&is=69571ebe&hm=e2a0ba4e68cbe9d6034bc145343903fd54221e97f640efa2c8a3e0093cd17c99&animated=true')
                    .addFields(
                        { name: '🏛️ النوع', value: 'تقرير لجنة', inline: true },
                        { name: '🕒 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📝 مقدّم التقرير', value: `<@${userId}>`, inline: true }
                    )
                    .setFooter({ text: 'نظام التقارير - لجنة الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await committeeReportChannel.send({ embeds: [committeeEmbed] });
                
                // تسجيل اللوج
                await logAction('إرسال تقرير لجنة', interaction.user, {
                    'محتوى التقرير': committeeReport.substring(0, 200)
                });
                
                await interaction.reply({ 
                    content: '✅ **تم إرسال تقرير اللجنة بنجاح!**', 
                    ephemeral: true 
                });
                break;
                
            case 'add_note_modal':
                const noteDate = interaction.fields.getTextInputValue('note_date');
                const noteUserId = interaction.fields.getTextInputValue('note_user_id');
                const noteReason = interaction.fields.getTextInputValue('note_reason');
                
                let noteTargetMember;
                try {
                    noteTargetMember = await interaction.guild.members.fetch(noteUserId);
                } catch {
                    noteTargetMember = null;
                }
                
 

 // إرسال الملاحظة
                const notesChannel = await client.channels.fetch(NOTES_CHANNEL_ID);
                
                const noteEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📝 ملاحظة جديدة على عضو')
                    .setDescription('**تم إضافة ملاحظة جديدة**')
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3135/3135715.png')
                    .addFields(
                        { name: '📅 تاريخ الملاحظة', value: noteDate, inline: true },
                        { name: '👤 العضو المعني', value: noteTargetMember ? `<@${noteUserId}>` : `آيدي: ${noteUserId}`, inline: true },
                        { name: '📝 السبب', value: noteReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: true },
                        { name: '🕒 وقت التسجيل', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: 'نظام الملاحظات - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await notesChannel.send({ embeds: [noteEmbed] });
                
                // تسجيل اللوج
                await logAction('إضافة ملاحظة', interaction.user, {
                    'التاريخ': noteDate,
                    'السبب': noteReason.substring(0, 200)
                }, noteTargetMember?.user || null);
                
                await interaction.reply({ 
                    content: `✅ **تم إضافة الملاحظة بنجاح!**`, 
                    ephemeral: true 
                });
                break;

                // =========إرسال الإمتياز
                const privilegeChannel = await client.channels.fetch(PRIVILEGE_CHANNEL_ID);
                
                const privilegeEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⭐ إمتياز جديد')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1455328057383715030/1456384496109879473/vip-card.png?ex=69582b42&is=6956d9c2&hm=4002d8d88137ae4ca315c002a9f977953bcf5545d2f2e7d3ce6923fd41a4c030&animated=true')
                    .addFields(
                        { name: '👤العضو ', value: `<@${privilegeUserId}>`, inline: false },
                        { name: '📅 تاريخ الإمتياز', value: privilegeDate, inline: false },
                        { name: '📝 السبب', value: privilegeReason, inline: false },
                        { name: '👤 المسؤول', value: `<@${userId}>`, inline: false },
                        { name: '🕒 وقت المنح', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'نتمني لك التوفيق و النجاح - الإدارة', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();
                
                await privilegeChannel.send({ embeds: [privilegeEmbed] });
                
                // تسجيل اللوج
                await logAction('منح إمتياز', interaction.user, {
                    'التاريخ': privilegeDate,
                    'السبب': privilegeReason.substring(0, 200),
                    'الرتبة الممنوحة': PRIVILEGE_ROLE_ID
                }, privilegeTargetMember.user);
                
                await interaction.reply({ 
                    content: `✅ **تم منح الإمتياز بنجاح!**`, 
                    ephemeral: true 
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة المودال:', error);
        await interaction.reply({ 
            content: '❌ **حدث خطأ أثناء معالجة البيانات!**', 
            ephemeral: true 
        });
    }
});

// أوامر الدردشة التقليدية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // الأنتي سبام للأوامر
    if (checkSpam(message.author.id, message.content.split(' ')[0])) {
        const warning = await message.reply('⚠️ **الرجاء الانتظار 3 ثواني بين كل أمر!**');
        setTimeout(() => warning.delete().catch(() => {}), 3000);
        return;
    }
    


// الرتبة المشتركة لكل الأوامر
const COMMAND_ROLE_ID = '1455328577783468185'; // الرتبة اللي تقدر تستخدم !say و !clear
const COMMAND_LOG_CHANNEL_ID = '1456111431630979113'; // قناة اللوج

// الأمر !clear
if (message.content.startsWith('!clear')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
        return message.reply('⚠️ **استخدم: `!clear <عدد>`**');
    }

    if (amount < 1 || amount > 100) {
        return message.reply('⚠️ **يمكن مسح من 1 إلى 100 رسالة فقط!**');
    }

    try {
        await message.channel.bulkDelete(amount + 1, true);

        const reply = await message.channel.send(`✅ **تم مسح ${amount} رسالة!**`);
        setTimeout(() => reply.delete(), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🧹 أمر !clear')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'عدد الرسائل', value: `${amount}`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في مسح الرسائل:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

// الأمر !say
if (message.content.startsWith('!say')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(COMMAND_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const content = message.content.slice(5).trim();
    if (!content) {
        return message.reply('⚠️ **استخدم: `!say <الرسالة>`**');
    }

    try {
        await message.delete();
        await message.channel.send({ content: content });

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('📢 أمر !say')
                .addFields(
                    { name: 'المستخدم', value: `<@${message.author.id}>`, inline: true },
                    { name: 'القناة', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'الرسالة', value: `${content.substring(0, 1000)}`, inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('❌ خطأ في إرسال الرسالة:', error);
        message.reply('❌ **حدث خطأ أثناء تنفيذ الأمر!**');
    }
}

    

    // الأمر !refresh
    if (message.content.startsWith('!refresh')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            const reply = await message.reply('🔄 **جاري التحديث...**');
            
            // تسجيل اللوج
            await logAction('تحديث اللوحة عبر الأمر', message.author);
            
            await createControlPanel();
            await reply.edit('✅ **تم التحديث!**');
            setTimeout(() => reply.delete(), 5000);
        } catch (error) {
            console.error('❌ خطأ في تحديث اللوحة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }
    
    // الأمر !status
    if (message.content.startsWith('!status')) {
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('⛔ **ليس لديك صلاحية!**');
        }
        
        try {
            await updateBotStatusEmbed();
            message.reply('✅ **تم تحديث حالة البوت!**');
        } catch (error) {
            console.error('❌ خطأ في تحديث الحالة:', error);
            message.reply('❌ **حدث خطأ!**');
        }
    }


// ===== أمر !tag تغيير الاسم =====
if (message.content.startsWith('!tag')) {
    // التحقق من الصلاحية
    if (!message.member.roles.cache.has(process.env.TAG_ROLE_ID)) {
        return message.reply('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**');
    }

    const member = message.mentions.members.first();
    const newName = message.content.split(' ').slice(2).join(' ');

    if (!member || !newName) {
        return message.reply('⚠️ **استخدم:** `!tag @user الاسم_الجديد`');
    }

    try {
        const oldName = member.nickname || member.user.username;

        await member.setNickname(newName);

        // إرسال رسالة الرد وحفظها في متغير
        const sentMsg = await message.reply(
            `✅ **تم تغيير الاسم بنجاح**\n` +
            `👤 ${member.user.tag}\n` +
            `✏️ ${oldName} ➜ ${newName}`
        );

        // مسح الرسالة بعد 3 ثواني (3000 ملي ثانية)
        setTimeout(() => sentMsg.delete().catch(() => {}), 3000);

        // تسجيل اللوج
        const logChannel = await message.client.channels.fetch(
            process.env.TAG_LOG_CHANNEL_ID
        );

        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🏷️ أمر !tag')
                .setColor(0x3498DB)
                .addFields(
                    { name: '👮 بواسطة', value: `<@${message.author.id}>`, inline: false },
                    { name: '👤 العضو', value: `<@${member.id}>`, inline: false },
                    { name: '✏️ الاسم القديم', value: oldName, inline: false },
                    { name: '🆕 الاسم الجديد', value: newName, inline: false },
                    { name: '📍 القناة', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('❌ خطأ في أمر !tag:', error);
        const errorMsg = await message.reply('❌ **حدث خطأ أثناء تغيير الاسم!**');
        // مسح رسالة الخطأ بعد 3 ثواني كمان
        setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
    }
}
});




// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);