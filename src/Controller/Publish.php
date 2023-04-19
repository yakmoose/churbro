<?php
declare(strict_types=1);

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

use function Symfony\Component\DependencyInjection\Loader\Configurator\iterator;

class Publish extends AbstractController
{

    #[Route("/publish", name: 'publish', methods: ["POST"])]
    public function trigger(Connection $connection, $vapidKeys, $messageSubject, $messagePayload): JsonResponse
    {

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => $messageSubject,
                'publicKey' => $vapidKeys['publicKey'],
                'privateKey' => $vapidKeys['privateKey'],
            ]
        ]);

        $stmt = $connection->prepare("SELECT * FROM subscription");
        $result = $stmt->executeQuery();
        while($row = $result->fetchAssociative()) {
            $webPush->queueNotification(
                Subscription::create(json_decode($row['raw_subscription'],true)),
                json_encode($messagePayload)
            );
        }

        $responses = $webPush->flush(50);
        $response = [];
        foreach ($responses as $r) {
            if (!$r->isSuccess()) {
                $connection->delete(
                    'subscription',
                    [
                        'endpoint' => $r->getEndpoint()
                    ]
                );
            }
        }

        return new JsonResponse(['YEEEEHAAAWWW!', count($response), count(array_filter($response, fn($r) => !$r->isSuccess()))]);
    }
}
