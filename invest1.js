const { Client, Collection, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const fs = require('fs');
let data = require('./data.json');

client.commands = new Collection();

const allowedUsers = ['866758876074606602', 'Тут добавите айди своё'];

setInterval(() => {
  for (const userId in data.users) {
    const user = data.users[userId];
    const income = Math.floor(user.balance * 0.01); // 1% дохода в секунду
    user.balance += income;
  }
  fs.writeFileSync('data.json', JSON.stringify(data));
}, 60000); // обновляем каждые 60 секунд

const commands = [
  new SlashCommandBuilder()
   .setName('withdraw')
   .setDescription('Вывод средств')
   .addIntegerOption(option => option.setName('amount').setDescription('Сумма вывода').setRequired(true))
   .addStringOption(option => option.setName('bank_number').setDescription('Номер банковской карты').setRequired(true)),
  new SlashCommandBuilder()
   .setName('donate')
   .setDescription('Пожертвование')
   .addIntegerOption(option => option.setName('amount').setDescription('Сумма пожертвования').setRequired(true)),
  new SlashCommandBuilder()
   .setName('addbalance')
   .setDescription('Добавление баланса (ДЛЯ АДМИНОВ)')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true))
   .addIntegerOption(option => option.setName('amount').setDescription('Сумма добавления').setRequired(true)),
  new SlashCommandBuilder()
   .setName('balance')
   .setDescription('Баланс'),
  new SlashCommandBuilder()
   .setName('profile')
   .setDescription('Профиль')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true)),
  new SlashCommandBuilder()
   .setName('addlevel')
   .setDescription('Добавление уровня (ДЛЯ АДМИНОВ)')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true))
   .addIntegerOption(option => option.setName('level').setDescription('Уровень').setRequired(true)),
  new SlashCommandBuilder()
   .setName('invest')
   .setDescription('Инвестирование')
   .addIntegerOption(option => option.setName('amount').setDescription('Сумма инвестирования').setRequired(true)),
  new SlashCommandBuilder()
   .setName('removebalance')
   .setDescription('Удаление баланса (ДЛЯ АДМИНОВ)')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true))
   .addIntegerOption(option => option.setName('amount').setDescription('Сумма удаления').setRequired(true)),
  new SlashCommandBuilder()
   .setName('addprivilege')
   .setDescription('Добавление привилегии (ДЛЯ АДМИНОВ)')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true))
   .addStringOption(option => option.setName('privilege').setDescription('Привилегия').setRequired(true)),
  new SlashCommandBuilder()
   .setName('info')
   .setDescription('инфо привилегий'),
   new SlashCommandBuilder()
   .setName('send')
   .setDescription('Отправка сообщений юзеру в дм (ДЛЯ АДМИНОВ)')
   .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true))
   .addStringOption(option => option.setName('message').setDescription('сообщение').setRequired(true)),
];

commands.forEach(command => client.commands.set(command.name, command));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const commandsArray = commands.map(command => command.toJSON());
  client.application.commands.set(commandsArray);
});

client.on('guildCreate', guild => {
  console.log(`Новая гильдия присоединена: ${guild.name}`);
  guild.commands.create(commands.map(command => command.toJSON()));
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const user = interaction.user;
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    if (interaction.commandName === 'withdraw') {
      const amount = interaction.options.getInteger('amount');
      const bankNumber = interaction.options.getString('bank_number');
      const targetUser = await client.users.fetch('тут тоже');
      if (!targetUser) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Пользователь с ID ${tragetUser}2 не найден`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetUser.send(`Вывод средств: ${amount} рублей на счёт ${bankNumber}, от пользователя ${interaction.user.username} (ID: ${interaction.user.id})`);
        const embed = new EmbedBuilder()
         .setTitle('Вывод средств')
         .setDescription(`Ждите отправления в лс, то что вам вывели успешно !`)
         .setColor('#00ff00')
         .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Ошибка при отправке сообщения: ${error}`);
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Ошибка при отправке сообщения`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
} else if (interaction.commandName === 'send') {
  if (!allowedUsers.includes(interaction.user.id)) {
    const embed = new EmbedBuilder()
    .setTitle('Ошибка')
    .setDescription(`У вас нет доступа к этой команде`)
    .setColor('#ff0000')
    .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }
  const userId = interaction.options.getString('user_id');
  const message = interaction.options.getString('message');

  if (!data.users[userId]) {
    const embed = new EmbedBuilder()
     .setTitle('Ошибка')
     .setDescription(`Пользователь с ID ${userId} не найден`)
     .setColor('#ff0000')
     .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const user = await client.users.fetch(userId);
  try {
    const dmChannel = await user.createDM();
    await dmChannel.send(message);

    const embed = new EmbedBuilder()
     .setTitle('Успешно!')
     .setDescription(`Сообщение отправлено пользователю с ID ${userId}`)
     .setColor('#00ff00')
     .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error(`Error sending message to user ${userId}:`, error);
    const embed = new EmbedBuilder()
     .setTitle('Ошибка')
     .setDescription(`Ошибка при отправке сообщения пользователю с ID ${userId}`)
     .setColor('#ff0000')
     .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
    } else if (interaction.commandName === 'donate') {
      const amount = interaction.options.getInteger('amount');
      if (!data.users[user.id]) data.users[user.id] = { balance: 0, privileges: [], level: 0 };
      data.users[user.id].balance += amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
       .setTitle('Пожертвование')
       .setDescription(`Вы пожертвовали ${amount} рублей`)
       .setColor('#00ff00')
       .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'addbalance') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription('Недостаточно прав для выполнения этой команды.')
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const userId = interaction.options.getString('user_id');
      const amount = interaction.options.getInteger('amount');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [], level: 0 };
      data.users[userId].balance += amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
       .setTitle('Добавление баланса')
       .setDescription(`Баланс пользователя <@${userId}> пополнен на ${amount} рублей`)
       .setColor('#00ff00')
       .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'balance') {
      if (!data.users[user.id]) data.users[user.id] = { balance: 0, privileges: [], level: 0 };
      const embed = new EmbedBuilder()
       .setTitle('Баланс')
       .setDescription(`Ваш баланс составляет ${data.users[user.id].balance} рублей`)
       .setColor('#00ff00')
       .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'profile') {
      const userId = interaction.options.getString('user_id');
      if (!data.users[userId]) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Пользователь с ID ${userId} не найден`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const userBalance = data.users[userId].balance;
      const uprivilege = data.users[userId].privileges && data.users[userId].privileges.length > 0? data.users[userId].privileges.join(', ') : 'Инвестор';
      const ulevel = data.users[userId].level || 1;
      const embed = new EmbedBuilder()
       .setTitle('Профиль')
       .setDescription(`**Уровень:** ${ulevel}\n**Баланс:** ${userBalance} рублей\n**Привилегии:** ${uprivilege}`)
       .setColor('#00ff00')
       .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'addlevel') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription('Недостаточно прав для выполнения этой команды.')
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const userId = interaction.options.getString('user_id');
      const level = interaction.options.getInteger('level');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [], level: 0 };
      data.users[userId].level = level;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
      .setTitle('Добавление уровня')
      .setDescription(`Уровень пользователя <@${userId}> изменен на ${level}`)
      .setColor('#00ff00')
      .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'invest') {
      const amount = interaction.options.getInteger('amount');
      if (!data.users[user.id]) data.users[user.id] = { balance: 0, privileges: [], level: 0 };
      data.users[user.id].balance -= amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
      .setTitle('Инвестирование')
      .setDescription(`Вы инвестировали ${amount} рублей`)
      .setColor('#00ff00')
      .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'emovebalance') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
        .setTitle('Ошибка')
        .setDescription('Недостаточно прав для выполнения этой команды.')
        .setColor('#ff0000')
        .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const userId = interaction.options.getString('user_id');
      const amount = interaction.options.getInteger('amount');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [], level: 0 };
      data.users[userId].balance -= amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
      .setTitle('Удаление баланса')
      .setDescription(`Баланс пользователя <@${userId}> уменьшен на ${amount} рублей`)
      .setColor('#00ff00')
      .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'addprivilege') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
        .setTitle('Ошибка')
        .setDescription('Недостаточно прав для выполнения этой команды.')
        .setColor('#ff0000')
        .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const userId = interaction.options.getString('user_id');
      const privilege = interaction.options.getString('privilege');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [], level: 0 };
      data.users[userId].privileges.push(privilege);
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
      .setTitle('Добавление привилегии')
      .setDescription(`Привилегия "${privilege}" добавлена пользователю <@${userId}>`)
      .setColor('#00ff00')
      .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'info') {
      const embed = new EmbedBuilder()
      .setTitle('информация о привилегиях')
      .addFields([
         { name: 'Привилегия OWNER', value: 'Владельца привилегия, которая умеет всё и даже ебнуть тебя.', inline: false },
         { name: 'Привилегия ADMIN', value: 'Административная привилегия, которая умеет всё.', inline: false },
         { name: 'Привилегия Инвестор', value: 'Привилегия обычных пользователей, которых не имеет значение!', inline: false },
         { name: 'Привилегия КоалаИнвестор', value: 'Привилегия которая получает много рублей, ее дают олдам', inline: false },
         { name: 'Привилегия МинистрИнвестиций', value: 'У которого будет много процентов для инвестиций', inline: false },
       ])
      .setColor('#0099ff')
      .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Ошибка при выполнении команды.', ephemeral: true });
  }
});


client.login('ваш токен');