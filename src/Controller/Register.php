<?php
declare(strict_types=1);

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class Register extends AbstractController
{

    #[Route("/register", name: 'register', methods: ["POST"])]
    public function register(Connection $connection, Request $request): JsonResponse
    {

        $subscription =json_decode($request->getContent(), );
        $stmt = $connection->prepare("INSERT OR REPLACE INTO subscription (endpoint, raw_subscription) SELECT ?, ? WHERE NOT EXISTS (SELECT endpoint,raw_subscription FROM subscription WHERE endpoint = ?)");
        $stmt->executeQuery([
            $subscription->subscription->endpoint,
            json_encode($subscription->subscription),
            $subscription->subscription->endpoint,
        ]);

        return new JsonResponse("Call me Maybe");
    }
}
