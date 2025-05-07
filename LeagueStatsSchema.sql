-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: league_app
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `champion_mastery`
--

DROP TABLE IF EXISTS `champion_mastery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `champion_mastery` (
  `mastery_id` int NOT NULL AUTO_INCREMENT,
  `lol_account_id` int NOT NULL,
  `champion_id` int NOT NULL,
  `champion_level` int NOT NULL,
  `champion_points` int NOT NULL,
  `last_play_time` bigint NOT NULL,
  `tokens_earned` int DEFAULT '0',
  PRIMARY KEY (`mastery_id`),
  UNIQUE KEY `unique_account_champion` (`lol_account_id`,`champion_id`),
  CONSTRAINT `champion_mastery_ibfk_1` FOREIGN KEY (`lol_account_id`) REFERENCES `lol_accounts` (`lol_account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `champion_mastery`
--

LOCK TABLES `champion_mastery` WRITE;
/*!40000 ALTER TABLE `champion_mastery` DISABLE KEYS */;
/*!40000 ALTER TABLE `champion_mastery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `champions`
--

DROP TABLE IF EXISTS `champions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `champions` (
  `champion_id` int NOT NULL AUTO_INCREMENT,
  `riot_champion_id` int NOT NULL,
  `champion_name` varchar(100) NOT NULL,
  `champion_title` varchar(255) DEFAULT NULL,
  `champion_role` varchar(50) DEFAULT NULL,
  `stats_json` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`champion_id`),
  UNIQUE KEY `riot_champion_id` (`riot_champion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19381 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `champions`
--

LOCK TABLES `champions` WRITE;
/*!40000 ALTER TABLE `champions` DISABLE KEYS */;
INSERT INTO `champions` VALUES (1,266,'Aatrox','the Darkin Blade','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(2,103,'Ahri','the Nine-Tailed Fox','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(3,84,'Akali','the Rogue Assassin','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(4,166,'Akshan','the Rogue Sentinel','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(5,12,'Alistar','the Minotaur','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(6,799,'Ambessa','Matriarch of War','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(7,32,'Amumu','the Sad Mummy','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(8,34,'Anivia','the Cryophoenix','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(9,1,'Annie','the Dark Child','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(10,523,'Aphelios','the Weapon of the Faithful','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(11,22,'Ashe','the Frost Archer','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(12,136,'Aurelion Sol','The Star Forger','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(13,893,'Aurora','the Witch Between Worlds','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(14,268,'Azir','the Emperor of the Sands','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(15,432,'Bard','the Wandering Caretaker','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(16,200,'Bel\'Veth','the Empress of the Void','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(17,53,'Blitzcrank','the Great Steam Golem','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(18,63,'Brand','the Burning Vengeance','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(19,201,'Braum','the Heart of the Freljord','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(20,233,'Briar','the Restrained Hunger','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(21,51,'Caitlyn','the Sheriff of Piltover','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(22,164,'Camille','the Steel Shadow','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(23,69,'Cassiopeia','the Serpent\'s Embrace','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(24,31,'Cho\'Gath','the Terror of the Void','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(25,42,'Corki','the Daring Bombardier','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(26,122,'Darius','the Hand of Noxus','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(27,131,'Diana','Scorn of the Moon','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(28,119,'Draven','the Glorious Executioner','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(29,36,'Dr. Mundo','the Madman of Zaun','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(30,245,'Ekko','the Boy Who Shattered Time','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(31,60,'Elise','the Spider Queen','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(32,28,'Evelynn','Agony\'s Embrace','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(33,81,'Ezreal','the Prodigal Explorer','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(34,9,'Fiddlesticks','the Ancient Fear','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(35,114,'Fiora','the Grand Duelist','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(36,105,'Fizz','the Tidal Trickster','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(37,3,'Galio','the Colossus','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(38,41,'Gangplank','the Saltwater Scourge','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(39,86,'Garen','The Might of Demacia','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(40,150,'Gnar','the Missing Link','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(41,79,'Gragas','the Rabble Rouser','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(42,104,'Graves','the Outlaw','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(43,887,'Gwen','The Hallowed Seamstress','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(44,120,'Hecarim','the Shadow of War','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(45,74,'Heimerdinger','the Revered Inventor','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(46,910,'Hwei','the Visionary','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(47,420,'Illaoi','the Kraken Priestess','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(48,39,'Irelia','the Blade Dancer','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(49,427,'Ivern','the Green Father','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(50,40,'Janna','the Storm\'s Fury','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(51,59,'Jarvan IV','the Exemplar of Demacia','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(52,24,'Jax','Grandmaster at Arms','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(53,126,'Jayce','the Defender of Tomorrow','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(54,202,'Jhin','the Virtuoso','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(55,222,'Jinx','the Loose Cannon','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(56,145,'Kai\'Sa','Daughter of the Void','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(57,429,'Kalista','the Spear of Vengeance','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(58,43,'Karma','the Enlightened One','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(59,30,'Karthus','the Deathsinger','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(60,38,'Kassadin','the Void Walker','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(61,55,'Katarina','the Sinister Blade','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(62,10,'Kayle','the Righteous','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(63,141,'Kayn','the Shadow Reaper','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(64,85,'Kennen','the Heart of the Tempest','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(65,121,'Kha\'Zix','the Voidreaver','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(66,203,'Kindred','The Eternal Hunters','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(67,240,'Kled','the Cantankerous Cavalier','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(68,96,'Kog\'Maw','the Mouth of the Abyss','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(69,897,'K\'Sante','the Pride of Nazumah','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(70,7,'LeBlanc','the Deceiver','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(71,64,'Lee Sin','the Blind Monk','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(72,89,'Leona','the Radiant Dawn','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(73,876,'Lillia','the Bashful Bloom','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(74,127,'Lissandra','the Ice Witch','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(75,236,'Lucian','the Purifier','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(76,117,'Lulu','the Fae Sorceress','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(77,99,'Lux','the Lady of Luminosity','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(78,54,'Malphite','Shard of the Monolith','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(79,90,'Malzahar','the Prophet of the Void','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(80,57,'Maokai','the Twisted Treant','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(81,11,'Master Yi','the Wuju Bladesman','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(82,800,'Mel','the Soul\'s Reflection','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(83,902,'Milio','The Gentle Flame','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(84,21,'Miss Fortune','the Bounty Hunter','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(85,62,'Wukong','the Monkey King','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(86,82,'Mordekaiser','the Iron Revenant','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(87,25,'Morgana','the Fallen','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(88,950,'Naafiri','the Hound of a Hundred Bites','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(89,267,'Nami','the Tidecaller','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(90,75,'Nasus','the Curator of the Sands','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(91,111,'Nautilus','the Titan of the Depths','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(92,518,'Neeko','the Curious Chameleon','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(93,76,'Nidalee','the Bestial Huntress','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(94,895,'Nilah','the Joy Unbound','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(95,56,'Nocturne','the Eternal Nightmare','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(96,20,'Nunu & Willump','the Boy and His Yeti','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(97,2,'Olaf','the Berserker','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(98,61,'Orianna','the Lady of Clockwork','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(99,516,'Ornn','The Fire below the Mountain','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(100,80,'Pantheon','the Unbreakable Spear','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(101,78,'Poppy','Keeper of the Hammer','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(102,555,'Pyke','the Bloodharbor Ripper','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(103,246,'Qiyana','Empress of the Elements','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(104,133,'Quinn','Demacia\'s Wings','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(105,497,'Rakan','The Charmer','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(106,33,'Rammus','the Armordillo','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(107,421,'Rek\'Sai','the Void Burrower','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(108,526,'Rell','the Iron Maiden','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(109,888,'Renata Glasc','the Chem-Baroness','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(110,58,'Renekton','the Butcher of the Sands','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(111,107,'Rengar','the Pridestalker','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(112,92,'Riven','the Exile','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(113,68,'Rumble','the Mechanized Menace','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(114,13,'Ryze','the Rune Mage','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(115,360,'Samira','the Desert Rose','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(116,113,'Sejuani','Fury of the North','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(117,235,'Senna','the Redeemer','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(118,147,'Seraphine','the Starry-Eyed Songstress','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(119,875,'Sett','the Boss','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(120,35,'Shaco','the Demon Jester','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(121,98,'Shen','the Eye of Twilight','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(122,102,'Shyvana','the Half-Dragon','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(123,27,'Singed','the Mad Chemist','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(124,14,'Sion','The Undead Juggernaut','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(125,15,'Sivir','the Battle Mistress','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(126,72,'Skarner','the Primordial Sovereign','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(127,901,'Smolder','the Fiery Fledgling','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(128,37,'Sona','Maven of the Strings','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(129,16,'Soraka','the Starchild','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(130,50,'Swain','the Noxian Grand General','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(131,517,'Sylas','the Unshackled','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(132,134,'Syndra','the Dark Sovereign','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(133,223,'Tahm Kench','The River King','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(134,163,'Taliyah','the Stoneweaver','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(135,91,'Talon','the Blade\'s Shadow','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(136,44,'Taric','the Shield of Valoran','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(137,17,'Teemo','the Swift Scout','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(138,412,'Thresh','the Chain Warden','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(139,18,'Tristana','the Yordle Gunner','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(140,48,'Trundle','the Troll King','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(141,23,'Tryndamere','the Barbarian King','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(142,4,'Twisted Fate','the Card Master','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(143,29,'Twitch','the Plague Rat','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(144,77,'Udyr','the Spirit Walker','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(145,6,'Urgot','the Dreadnought','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(146,110,'Varus','the Arrow of Retribution','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(147,67,'Vayne','the Night Hunter','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(148,45,'Veigar','the Tiny Master of Evil','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(149,161,'Vel\'Koz','the Eye of the Void','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(150,711,'Vex','the Gloomist','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(151,254,'Vi','the Piltover Enforcer','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(152,234,'Viego','The Ruined King','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(153,112,'Viktor','the Herald of the Arcane','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(154,8,'Vladimir','the Crimson Reaper','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(155,106,'Volibear','the Relentless Storm','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(156,19,'Warwick','the Uncaged Wrath of Zaun','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(157,498,'Xayah','the Rebel','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(158,101,'Xerath','the Magus Ascendant','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(159,5,'Xin Zhao','the Seneschal of Demacia','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(160,157,'Yasuo','the Unforgiven','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(161,777,'Yone','the Unforgotten','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(162,83,'Yorick','Shepherd of Souls','Fighter',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(163,350,'Yuumi','the Magical Cat','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(164,154,'Zac','the Secret Weapon','Tank',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(165,238,'Zed','the Master of Shadows','Assassin',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(166,221,'Zeri','The Spark of Zaun','Marksman',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(167,115,'Ziggs','the Hexplosives Expert','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(168,26,'Zilean','the Chronokeeper','Support',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(169,142,'Zoe','the Aspect of Twilight','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57'),(170,143,'Zyra','Rise of the Thorns','Mage',NULL,'2025-04-28 21:22:57','2025-04-28 21:22:57');
/*!40000 ALTER TABLE `champions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lol_accounts`
--

DROP TABLE IF EXISTS `lol_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lol_accounts` (
  `lol_account_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `riot_account_id` varchar(100) DEFAULT NULL,
  `summoner_name` varchar(100) DEFAULT NULL,
  `region` varchar(50) DEFAULT NULL,
  `puuid` varchar(128) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `game_name` varchar(255) DEFAULT NULL,
  `tag_line` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`lol_account_id`),
  UNIQUE KEY `riot_account_id` (`riot_account_id`),
  UNIQUE KEY `idx_puuid` (`puuid`),
  KEY `fk_lol_accounts_user` (`user_id`),
  CONSTRAINT `fk_lol_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lol_accounts`
--

LOCK TABLES `lol_accounts` WRITE;
/*!40000 ALTER TABLE `lol_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `lol_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_history`
--

DROP TABLE IF EXISTS `match_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_history` (
  `match_history_id` int NOT NULL AUTO_INCREMENT,
  `lol_account_id` int NOT NULL,
  `match_id` varchar(50) NOT NULL,
  `champion_id` int DEFAULT '0',
  `champion_riot_id` varchar(50) DEFAULT NULL,
  `items_json` json DEFAULT NULL,
  `champion_name` varchar(255) DEFAULT NULL,
  `queue_id` int NOT NULL,
  `game_timestamp` bigint DEFAULT NULL,
  `game_duration` int DEFAULT NULL,
  `win` tinyint DEFAULT NULL,
  `kills` int DEFAULT NULL,
  `deaths` int DEFAULT NULL,
  `assists` int DEFAULT NULL,
  `team_position` varchar(10) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `stats_json` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `team_kills` int DEFAULT NULL,
  `team_objectives` int DEFAULT NULL,
  `first_blood` tinyint DEFAULT NULL,
  `first_tower` tinyint DEFAULT NULL,
  `baron_kills` int DEFAULT NULL,
  `match_type` varchar(20) DEFAULT NULL,
  `total_minions_killed` int DEFAULT '0',
  `total_damage_dealt` int DEFAULT '0',
  `total_damage_taken` int DEFAULT '0',
  `total_healing` int DEFAULT '0',
  `wards_placed` int DEFAULT '0',
  `wards_destroyed` int DEFAULT '0',
  `vision_score` int DEFAULT '0',
  `gold_earned` int DEFAULT '0',
  `gold_spent` int DEFAULT '0',
  `dragons_killed` int DEFAULT '0',
  `barons_killed` int DEFAULT '0',
  `turrets_destroyed` int DEFAULT '0',
  `largest_killing_spree` int DEFAULT '0',
  `largest_multi_kill` int DEFAULT '0',
  `objectives_stolen` int DEFAULT '0',
  PRIMARY KEY (`match_history_id`),
  UNIQUE KEY `uq_lolaccount_match` (`lol_account_id`,`match_id`),
  UNIQUE KEY `uq_match_id` (`match_id`),
  KEY `fk_match_history_champions` (`champion_id`),
  CONSTRAINT `fk_match_history_lol_accounts` FOREIGN KEY (`lol_account_id`) REFERENCES `lol_accounts` (`lol_account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_history`
--

LOCK TABLES `match_history` WRITE;
/*!40000 ALTER TABLE `match_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendation`
--

DROP TABLE IF EXISTS `recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `link` varchar(2083) DEFAULT NULL,
  `type` enum('video','website') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendation`
--

LOCK TABLES `recommendation` WRITE;
/*!40000 ALTER TABLE `recommendation` DISABLE KEYS */;
INSERT INTO `recommendation` VALUES (4,'The ULTIMATE Beginner\'s Guide to League of Legends! - Skill Capped','A comprehensive guide for new players.','https://www.youtube.com/watch?v=987uaDfwDuE','video','2025-04-22 22:51:19'),(5,'Why You SUCK at FARMING (And How to Fix It) - League of Legends','Tips and tricks to improve your creep score.','https://www.youtube.com/embed/987uaDfwDuE?si=pjrNQ4ZhguQoYOeI','video','2025-04-22 22:51:19'),(6,'ProGuides','Learn from the best players with this platform.','https://www.proguides.com','website','2025-04-22 22:51:19'),(7,'NEW UPDATED TIER LIST for PATCH 25.9 - League of Legends','The best champions of the current patch','https://www.youtube.com/embed/FOqqdovE3EM?si=onG5Irgi6S_o38U5','video','2025-05-06 20:07:12'),(8,'Why YOU SUCK at TOP LANE (And How To Fix It!) - Season 15','Easiest Ways to improve at toplane','https://www.youtube.com/embed/lsPK2SHtvUs?si=OpEXGPO6JH42iEXq','video','2025-05-06 20:07:12'),(9,'The COMPLETE Beginners Guide to JUNGLE for Season 15!','Easiest Ways to improve at Jungle','https://www.youtube.com/embed/Elp1MSxLaIc?si=DZr1BEp3rBkRFYVG','video','2025-05-06 20:07:12'),(10,'The COMPLETE Beginners Guide to MID LANE for Season 15!','Easiest Ways to improve at Midlane','https://www.youtube.com/embed/4ANL2xhON9c?si=2BuMCcKG4odTBWXI','video','2025-05-06 20:07:12'),(11,'Why YOU SUCK at ADC (And How To Fix It) - League of Legends','Easiest Ways to improve at Botlane','https://www.youtube.com/embed/OM14vGC9C8A?si=lW0xCsKjcNq5_Rx2','video','2025-05-06 20:07:12'),(12,'Why YOU SUCK at SUPPORT (And How To Fix It) - League of Legends','Easiest Ways to improve at Support','https://www.youtube.com/embed/dmx1JUYjWHc?si=pV4WpTIwhPpYYBIu','video','2025-05-06 20:07:12'),(13,'The 20 BEST TIPS for BEGINNERS in League of Legends','Things you might be missing out on in League of Legends','https://www.youtube.com/embed/4bs4v_GBShU?si=WLmWppfygGMsBppr','video','2025-05-06 20:07:12');
/*!40000 ALTER TABLE `recommendation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `summoner_profile`
--

DROP TABLE IF EXISTS `summoner_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `summoner_profile` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `lol_account_id` int NOT NULL,
  `queue_type` varchar(20) NOT NULL,
  `tier` varchar(20) NOT NULL,
  `rank_division` varchar(5) NOT NULL,
  `league_points` int DEFAULT '0',
  `wins` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `hot_streak` tinyint(1) DEFAULT '0',
  `veteran` tinyint(1) DEFAULT '0',
  `fresh_blood` tinyint(1) DEFAULT '0',
  `inactive` tinyint(1) DEFAULT '0',
  `mini_series_progress` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `summoner_level` int DEFAULT '0',
  `profile_icon_id` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `unique_account_queue` (`lol_account_id`,`queue_type`),
  CONSTRAINT `fk_summoner_profile_lol_accounts` FOREIGN KEY (`lol_account_id`) REFERENCES `lol_accounts` (`lol_account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `summoner_profile`
--

LOCK TABLES `summoner_profile` WRITE;
/*!40000 ALTER TABLE `summoner_profile` DISABLE KEYS */;
/*!40000 ALTER TABLE `summoner_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `salt` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'league_app'
--

--
-- Dumping routines for database 'league_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-06 21:22:00
