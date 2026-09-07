CREATE TABLE `communityServiceSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`capstoneProject` varchar(255) NOT NULL,
	`serviceDate` varchar(10) NOT NULL,
	`attendance` varchar(64) NOT NULL,
	`participation` text NOT NULL,
	`contributions` text NOT NULL,
	`completedAssignedTask` enum('yes','no') NOT NULL,
	`mentorRating` varchar(255) NOT NULL,
	`improvementFeedback` text NOT NULL,
	`conflictResolution` varchar(255) NOT NULL,
	`assignedTasks` text NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityServiceSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
